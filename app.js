/* =============================================
   BRASSE — Ceiling Fan Placement Engine
   ============================================= */

// ── Constants ──────────────────────────────────────
const MARKET_DIAMETERS_CM = [70, 80, 90, 103, 107, 112, 122, 127, 132, 142, 152, 166];
const EPSILON = 1e-9;
const BED_MODE_DEFAULTS = {
    targetSquareSize: 2.5,
};
const FORM_FACTOR_TOOLTIP = "Rapport entre la plus grande et la plus petite dimension d'une zone. Plus il est proche de 1, plus la zone est proche d'un carré et plus la diffusion de l'air a des chances d'être régulière.";
const MOUNTING_TOOLTIPS = {
    Standard: "Montage de référence avec une retombée d'environ 0,35 fois le diamètre. C'est le cas le plus favorable pour la performance.",
    'Low-profile': "Montage plus proche du plafond, utilisé quand la hauteur manque pour un standard. Le brassage reste bon, mais la performance est un peu moins favorable.",
    Flush: "Montage très plaqué au plafond. Cette configuration est généralement moins performante et doit être évitée si une autre solution est possible.",
};

const USAGE_DATA = {
    chambre:  { label: "Chambre / Repos",            met: 0.8,  vMin: 0.4, vMax: 0.6, dbaMin: 18, dbaMax: 30 },
    sejour:   { label: "Séjour / Activités douces",  met: 1.1,  vMin: 0.6, vMax: 0.8, dbaMin: 24, dbaMax: 34 },
    bureau:   { label: "Bureau / Tertiaire",         met: 1.15, vMin: 0.8, vMax: 1.0, dbaMin: 26, dbaMax: 42 },
    scolaire: { label: "Scolaire / Enseignement",    met: 1.3,  vMin: 0.8, vMax: 1.3, dbaMin: 32, dbaMax: 42 },
    sport:    { label: "Sport / Activités soutenues", met: 1.5,  vMin: 1.3, vMax: 2.0, dbaMin: 38, dbaMax: 48 },
};

function usageAllowsCoverageMode(usage) {
    return usage === 'chambre' || usage === 'sejour';
}

// Approximate CE (°C) for given air speed (m/s)
// Based on BRASSE conditions: T=28°C, HR=60%, met=1.1, clo=0.5
function estimateCE(vAir) {
    if (vAir <= 0) return 0;
    // Logarithmic fit from the SURYA data
    return Math.min(7, 1.5 + 2.8 * Math.log(1 + vAir * 2));
}

// ── Main Calculation Engine ───────────────────────

function calculate(roomL, roomW, HSP, usage, userDiameterCm, options = {}) {
    const requestedCoverageMode = options.coverageMode || 'uniform';
    const coverageMode = usageAllowsCoverageMode(usage) ? requestedCoverageMode : 'uniform';
    if (coverageMode === 'bed-wall') {
        return calculateBedWallMode(roomL, roomW, HSP, usage, userDiameterCm, options);
    }

    return calculateUniformMode(roomL, roomW, HSP, usage, userDiameterCm);
}

function calculateDiagnostic(roomL, roomW, HSP, usage, userDiameterCm, options = {}) {
    if (!userDiameterCm) {
        return { error: "Aucun diamètre manuel à diagnostiquer." };
    }

    const requestedCoverageMode = options.coverageMode || 'uniform';
    const coverageMode = usageAllowsCoverageMode(usage) ? requestedCoverageMode : 'uniform';
    if (coverageMode === 'bed-wall') {
        return calculateBedWallDiagnosticMode(roomL, roomW, HSP, usage, userDiameterCm, options);
    }

    return calculateUniformDiagnosticMode(roomL, roomW, HSP, usage, userDiameterCm);
}

function calculateUniformMode(roomL, roomW, HSP, usage, userDiameterCm) {
    // Normalize: L >= W
    const L = Math.max(roomL, roomW);
    const W = Math.min(roomL, roomW);
    const usageData = USAGE_DATA[usage];
    const userD = userDiameterCm ? userDiameterCm / 100 : null; // convert to meters

    let bestConfig = null;
    let bestScore = -Infinity;

    // Try different cell configurations: Nx divisions along L, Ny along W
    for (let nx = 1; nx <= 6; nx++) {
        for (let ny = 1; ny <= 6; ny++) {
            const cellL = L / nx;
            const cellW = W / ny;
            const cellArea = cellL * cellW;
            const sqrtArea = Math.sqrt(cellArea);
            const ffCell = Math.max(cellL, cellW) / Math.min(cellL, cellW);

            // Skip configurations that violate shape or size guidelines
            if (ffCell >= 1.41) continue; // Rule 2: FF must be < 1.41
            if (nx * ny > 12) continue; // Fragmented
            if (cellL < 1.5 || cellW < 1.5) continue;

            // ── Compute D_max from all constraints ──

            // Rule 3: FCC ∈ [0.2, 0.4]
            const dMaxFCC = 0.4 * sqrtArea;
            const dMinFCC = 0.2 * sqrtArea;

            // Rule 4: P > D (center-to-wall > diameter)
            const dMaxWall = Math.min(cellL / 2, cellW / 2);

            // Rule 5: E > 2.5D (inter-fan distance)
            let dMaxInter = Infinity;
            if (nx > 1) dMaxInter = Math.min(dMaxInter, cellL / 2.5);
            if (ny > 1) dMaxInter = Math.min(dMaxInter, cellW / 2.5);

            const dMaxHeight = resolveHeightLimit(HSP);

            // Overall D_max
            const dMax = Math.min(dMaxFCC, dMaxWall, dMaxInter, dMaxHeight);

            if (dMax < dMinFCC || dMax <= 0) continue; // Not viable

            const diameterChoice = resolveDiameterChoice(dMinFCC, dMax, userD);
            if (!diameterChoice) continue;
            const { D, marketDiameterCm } = diameterChoice;

            // ── Verify all constraints with chosen D ──
            const fcc = D / sqrtArea;
            const distWall = Math.min(cellL / 2, cellW / 2);
            const wallOk = distWall + EPSILON >= D;

            let interDist = Infinity;
            if (nx > 1) interDist = Math.min(interDist, cellL);
            if (ny > 1) interDist = Math.min(interDist, cellW);
            const interOk = interDist === Infinity || interDist + EPSILON >= 2.5 * D;

            const mounting = resolveMounting(D, HSP);
            if (!mounting) continue;

            const hPalesOk = mounting.hPalesOk;
            if (!wallOk || !interOk || !hPalesOk) continue;

            // Score: balance between mounting quality and diameter size
            // Standard gets a bonus, but not so large it forces tiny diameters.
            // D*1000 makes diameter the primary factor (range ~700-1660)
            // Standard bonus of 200 means we prefer standard only if D difference is <20cm
            const mountingBonus = mounting.mountingType === "Standard" ? 200 : 0;
            const score = mountingBonus + D * 1000 + (2 - ffCell) * 50 - (nx * ny) * 10;

            if (score > bestScore) {
                bestScore = score;
                bestConfig = {
                    nx, ny,
                    numFans: nx * ny,
                    cellL, cellW, cellArea,
                    ffCell,
                    D,
                    dCm: Math.round(D * 100),
                    dMax,
                    fcc,
                    dMaxFCC, dMinFCC, dMaxWall, dMaxInter, dMaxHeight,
                    distWall,
                    wallOk,
                    interDist: interDist === Infinity ? null : interDist,
                    interOk,
                    ...mounting,
                    marketDiameterCm,
                    L, W, HSP,
                    coverageMode: 'uniform',
                    usageKey: usage,
                    manualDiameterCm: userDiameterCm || null,
                };
            }
        }
    }

    if (!bestConfig) {
        return { error: "Aucune configuration viable trouvée. Vérifiez les dimensions (plafond trop bas ou pièce trop petite)." };
    }

    bestConfig.fanPositions = [];
    for (let ix = 0; ix < bestConfig.nx; ix++) {
        for (let iy = 0; iy < bestConfig.ny; iy++) {
            bestConfig.fanPositions.push({
                x: (ix + 0.5) * bestConfig.cellL,
                y: (iy + 0.5) * bestConfig.cellW,
            });
        }
    }

    return finalizeResult(bestConfig, usageData);
}

function calculateUniformDiagnosticMode(roomL, roomW, HSP, usage, userDiameterCm) {
    const L = Math.max(roomL, roomW);
    const W = Math.min(roomL, roomW);
    const usageData = USAGE_DATA[usage];
    const userD = userDiameterCm / 100;

    let bestConfig = null;
    let bestScore = -Infinity;

    for (let nx = 1; nx <= 6; nx++) {
        for (let ny = 1; ny <= 6; ny++) {
            const cellL = L / nx;
            const cellW = W / ny;
            const cellArea = cellL * cellW;
            const sqrtArea = Math.sqrt(cellArea);
            const ffCell = Math.max(cellL, cellW) / Math.min(cellL, cellW);

            if (nx * ny > 12) continue;
            if (cellL < 1.5 || cellW < 1.5) continue;

            const dMaxFCC = 0.4 * sqrtArea;
            const dMinFCC = 0.2 * sqrtArea;
            const dMaxWall = Math.min(cellL / 2, cellW / 2);

            let dMaxInter = Infinity;
            if (nx > 1) dMaxInter = Math.min(dMaxInter, cellL / 2.5);
            if (ny > 1) dMaxInter = Math.min(dMaxInter, cellW / 2.5);

            const dMaxHeight = resolveHeightLimit(HSP);
            const dMax = Math.min(dMaxFCC, dMaxWall, dMaxInter, dMaxHeight);
            const D = userD;
            const fcc = D / sqrtArea;
            const distWall = Math.min(cellL / 2, cellW / 2);
            const wallOk = distWall + EPSILON >= D;

            let interDist = Infinity;
            if (nx > 1) interDist = Math.min(interDist, cellL);
            if (ny > 1) interDist = Math.min(interDist, cellW);
            const interOk = interDist === Infinity || interDist + EPSILON >= 2.5 * D;

            const mounting = resolveMounting(D, HSP, { allowInvalid: true });
            const fccOk = fcc + EPSILON >= 0.2 && fcc - EPSILON <= 0.4;
            const ffOk = ffCell < 1.41;
            const hMontageOk = mounting.hMontageOk;
            const hPalesOk = mounting.hPalesOk;

            const failureCount = [fccOk, ffOk, wallOk, interOk, hMontageOk, hPalesOk].filter(ok => !ok).length;
            const severity = Math.max(0, 0.2 - fcc)
                + Math.max(0, fcc - 0.4)
                + Math.max(0, ffCell - 1.41)
                + Math.max(0, D - distWall)
                + (interDist === Infinity ? 0 : Math.max(0, 2.5 * D - interDist))
                + Math.max(0, mounting.hMontageMinAllowed - mounting.hMontage)
                + Math.max(0, mounting.securityHeight - mounting.hPales);

            const mountingBonus = mounting.mountingType === 'Standard'
                ? 200
                : mounting.mountingType === 'Low-profile'
                    ? 100
                    : 0;
            const score = -failureCount * 100000 - severity * 1000 + mountingBonus + (2 - Math.min(ffCell, 2)) * 50 - (nx * ny) * 10;

            if (score > bestScore) {
                bestScore = score;
                bestConfig = {
                    nx, ny,
                    numFans: nx * ny,
                    cellL, cellW, cellArea,
                    ffCell,
                    D,
                    dCm: Math.round(D * 100),
                    dMax,
                    fcc,
                    dMaxFCC, dMinFCC, dMaxWall, dMaxInter, dMaxHeight,
                    distWall,
                    wallOk,
                    interDist: interDist === Infinity ? null : interDist,
                    interOk,
                    ...mounting,
                    marketDiameterCm: findLargestCompatibleMarketDiameter(dMinFCC, Math.max(dMax, 0)),
                    L, W, HSP,
                    coverageMode: 'uniform',
                    usageKey: usage,
                    manualDiameterCm: userDiameterCm,
                    isDiagnostic: true,
                };
            }
        }
    }

    if (!bestConfig) {
        return { error: "Aucune implantation de diagnostic n'a pu être générée pour ce diamètre manuel." };
    }

    bestConfig.fanPositions = [];
    for (let ix = 0; ix < bestConfig.nx; ix++) {
        for (let iy = 0; iy < bestConfig.ny; iy++) {
            bestConfig.fanPositions.push({
                x: (ix + 0.5) * bestConfig.cellL,
                y: (iy + 0.5) * bestConfig.cellW,
            });
        }
    }

    return finalizeResult(bestConfig, usageData);
}

function calculateBedWallMode(roomL, roomW, HSP, usage, userDiameterCm, options) {
    const L = Math.max(roomL, roomW);
    const W = Math.min(roomL, roomW);
    const usageData = USAGE_DATA[usage];
    const userD = userDiameterCm ? userDiameterCm / 100 : null;
    const targetZone = buildBedWallTargetZone(L, W, options);
    const cellArea = targetZone.rect.width * targetZone.rect.height;
    const sqrtArea = Math.sqrt(cellArea);
    const ffCell = Math.max(targetZone.rect.width, targetZone.rect.height) / Math.min(targetZone.rect.width, targetZone.rect.height);
    const dMinFCC = 0.2 * sqrtArea;
    const dMaxFCC = 0.4 * sqrtArea;
    const wallDistances = computeWallDistances(L, W, targetZone.fanCenter);
    const dMaxWall = getMinWallDistance(wallDistances);
    const dMaxHeight = resolveHeightLimit(HSP);
    const dMax = Math.min(dMaxFCC, dMaxWall, dMaxHeight);

    if (dMax < dMinFCC || dMax <= 0) {
        return { error: "La zone de couchage choisie ne permet pas un diamètre cohérent. Réduisez la zone ciblée ou déplacez l'axe du couchage." };
    }

    const diameterChoice = resolveDiameterChoice(dMinFCC, dMax, userD);
    if (!diameterChoice) {
        return { error: "Le diamètre saisi ne respecte pas les contraintes de la zone de couchage ciblée." };
    }

    const mounting = resolveMounting(diameterChoice.D, HSP);
    if (!mounting) {
        return { error: "Hauteur insuffisante pour positionner ce ventilateur au-dessus de la zone de couchage." };
    }

    return finalizeResult({
        coverageMode: 'bed-wall',
        nx: 1,
        ny: 1,
        numFans: 1,
        cellL: targetZone.rect.width,
        cellW: targetZone.rect.height,
        cellArea,
        ffCell,
        D: diameterChoice.D,
        dCm: Math.round(diameterChoice.D * 100),
        dMax,
        fcc: diameterChoice.D / sqrtArea,
        dMaxFCC,
        dMinFCC,
        dMaxWall,
        dMaxInter: null,
        dMaxHeight,
        distWall: dMaxWall,
        wallDistances,
        wallOk: dMaxWall + EPSILON >= diameterChoice.D,
        interDist: null,
        interOk: true,
        ...mounting,
        marketDiameterCm: diameterChoice.marketDiameterCm,
        L,
        W,
        HSP,
        usageKey: usage,
        fanPositions: [targetZone.fanCenter],
        targetZoneRect: targetZone.rect,
        targetZoneName: targetZone.name,
        localComfortOnly: true,
        manualDiameterCm: userDiameterCm || null,
    }, usageData);
}

function calculateBedWallDiagnosticMode(roomL, roomW, HSP, usage, userDiameterCm, options) {
    const L = Math.max(roomL, roomW);
    const W = Math.min(roomL, roomW);
    const usageData = USAGE_DATA[usage];
    const userD = userDiameterCm / 100;
    const targetZone = buildBedWallTargetZone(L, W, options);
    const cellArea = targetZone.rect.width * targetZone.rect.height;
    const sqrtArea = Math.sqrt(cellArea);
    const ffCell = Math.max(targetZone.rect.width, targetZone.rect.height) / Math.min(targetZone.rect.width, targetZone.rect.height);
    const dMinFCC = 0.2 * sqrtArea;
    const dMaxFCC = 0.4 * sqrtArea;
    const wallDistances = computeWallDistances(L, W, targetZone.fanCenter);
    const dMaxWall = getMinWallDistance(wallDistances);
    const dMaxHeight = resolveHeightLimit(HSP);
    const dMax = Math.min(dMaxFCC, dMaxWall, dMaxHeight);
    const mounting = resolveMounting(userD, HSP, { allowInvalid: true });

    return finalizeResult({
        coverageMode: 'bed-wall',
        nx: 1,
        ny: 1,
        numFans: 1,
        cellL: targetZone.rect.width,
        cellW: targetZone.rect.height,
        cellArea,
        ffCell,
        D: userD,
        dCm: Math.round(userD * 100),
        dMax,
        fcc: userD / sqrtArea,
        dMaxFCC,
        dMinFCC,
        dMaxWall,
        dMaxInter: null,
        dMaxHeight,
        distWall: dMaxWall,
        wallDistances,
        wallOk: dMaxWall + EPSILON >= userD,
        interDist: null,
        interOk: true,
        ...mounting,
        marketDiameterCm: findLargestCompatibleMarketDiameter(dMinFCC, Math.max(dMax, 0)),
        L,
        W,
        HSP,
        usageKey: usage,
        fanPositions: [targetZone.fanCenter],
        targetZoneRect: targetZone.rect,
        targetZoneName: targetZone.name,
        localComfortOnly: true,
        manualDiameterCm: userDiameterCm,
        isDiagnostic: true,
    }, usageData);
}

function finalizeResult(config, usageData) {
    config.usage = usageData;

    // Estimate performance
    const vAirEstimate = usageData.vMin + (usageData.vMax - usageData.vMin) * Math.min(1, config.fcc / 0.4) * config.mountingFactor;
    config.vAirEstimate = vAirEstimate;
    config.ceEstimate = estimateCE(vAirEstimate);
    return config;
}

function buildBedWallTargetZone(L, W, options) {
    const side = Math.min(
        Number.isFinite(options.targetSquareSize) ? options.targetSquareSize : BED_MODE_DEFAULTS.targetSquareSize,
        L,
        W,
    );

    return {
        name: `Zone type ${formatMeters(side)} x ${formatMeters(side)} m contre un mur`,
        rect: {
            x: 0,
            y: (W - side) / 2,
            width: side,
            height: side,
        },
        fanCenter: {
            x: side / 2,
            y: W / 2,
        },
    };
}

function computeWallDistances(L, W, center) {
    return {
        left: center.x,
        right: L - center.x,
        top: center.y,
        bottom: W - center.y,
    };
}

function getMinWallDistance(wallDistances) {
    return Math.min(wallDistances.left, wallDistances.right, wallDistances.top, wallDistances.bottom);
}

function resolveHeightLimit(HSP) {
    const dMaxSmall = (HSP - 2.13) / 0.25;
    if (dMaxSmall < 2.13) {
        return dMaxSmall;
    }

    const dMaxLarge = Math.min((HSP - 3.0) / 0.25, HSP / 1.05);
    return Math.max(2.129, dMaxLarge);
}

function resolveDiameterChoice(dMin, dMax, userD) {
    if (userD) {
        if (userD > dMax + EPSILON || userD < dMin - EPSILON) return null;
        return { D: userD, marketDiameterCm: null };
    }

    return {
        D: dMax,
        marketDiameterCm: findLargestCompatibleMarketDiameter(dMin, dMax),
    };
}

function resolveMounting(D, HSP, options = {}) {
    let hPalesMin;
    let hPalesMax;
    let securityHeight;

    if (D < 2.13) {
        securityHeight = 2.13;
        hPalesMin = 2.13;
        hPalesMax = 2.0 * D;
    } else {
        securityHeight = 3.0;
        hPalesMin = Math.max(3.0, 0.8 * D);
        hPalesMax = 1.2 * D;
    }

    const hMontageMinAllowed = 0.25 * D;
    const hMontageStd = 0.35 * D;
    if (HSP + EPSILON < hPalesMin + hMontageMinAllowed) {
        if (!options.allowInvalid) {
            return null;
        }

        const hMontage = Math.max(0, Math.min(hMontageMinAllowed, HSP));
        const hPales = Math.max(0, HSP - hMontage);
        return {
            hPalesMin,
            hPalesMax,
            hPales,
            hMontage,
            hMontageMinAllowed,
            hPalesOk: hPales + EPSILON >= securityHeight,
            hMontageOk: hMontage + EPSILON >= hMontageMinAllowed,
            mountingType: 'Non conforme',
            mountingFactor: 0.6,
            securityHeight,
            mountingDiagnostic: true,
        };
    }

    let hMontage;
    let hPales;
    let mountingType;
    let mountingFactor;
    if (HSP - hMontageStd + EPSILON >= hPalesMin) {
        hMontage = hMontageStd;
        hPales = HSP - hMontageStd;
        mountingType = 'Standard';
        mountingFactor = 1.0;
    } else {
        // If standard is impossible, drop the fan as low as safety allows.
        hPales = hPalesMin;
        hMontage = HSP - hPalesMin;
        mountingType = 'Low-profile';
        mountingFactor = 0.85;
    }

    return {
        hPalesMin,
        hPalesMax,
        hPales,
        hMontage,
        hMontageMinAllowed,
        hPalesOk: hPales + EPSILON >= securityHeight,
        hMontageOk: hMontage + EPSILON >= hMontageMinAllowed,
        mountingType,
        mountingFactor,
        securityHeight,
        mountingDiagnostic: false,
    };
}

function findLargestCompatibleMarketDiameter(dMinMeters, dMaxMeters) {
    let best = null;
    for (const marketDiameterCm of MARKET_DIAMETERS_CM) {
        const marketDiameterMeters = marketDiameterCm / 100;
        if (marketDiameterMeters + EPSILON < dMinMeters) continue;
        if (marketDiameterMeters - EPSILON > dMaxMeters) continue;
        best = marketDiameterCm;
    }
    return best;
}

// ── UI Controller ─────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calc-form');
    const logoIcon = document.querySelector('.logo-icon');
    const logoImage = logoIcon ? logoIcon.querySelector('img') : null;
    const usageSelect = document.getElementById('room-usage');
    const coverageModeSelect = document.getElementById('coverage-mode');
    const coverageModeHint = document.getElementById('coverage-mode-hint');
    const placeholder = document.getElementById('results-placeholder');
    const resultsContent = document.getElementById('results-content');

    initLogoSpin();

    // Update usage info card on change
    usageSelect.addEventListener('change', () => {
        updateUsageInfo();
        updateCoverageModeAvailability();
    });
    updateUsageInfo();
    updateCoverageModeAvailability();

    // Auto-calculate as values change
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
        input.addEventListener(eventName, () => {
            if (form.checkValidity()) {
                runCalculation();
            }
        });
    });

    // Calculate on form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        runCalculation();
    });

    // Run initial calculation
    runCalculation();

    function updateCoverageModeAvailability() {
        const coverageAllowed = usageAllowsCoverageMode(usageSelect.value);
        coverageModeSelect.disabled = !coverageAllowed;

        if (!coverageAllowed) {
            coverageModeSelect.value = 'uniform';
            coverageModeHint.textContent = 'La stratégie de brassage locale est disponible uniquement pour Chambre / Repos et Séjour / Activités douces.';
            return;
        }

        coverageModeHint.textContent = 'Le mode local applique une zone type de 2,5 × 2,5 m contre un mur avec un seul ventilateur.';
    }

    function updateUsageInfo() {
        const u = USAGE_DATA[usageSelect.value];
        document.getElementById('usage-info-title').textContent = u.label;
        document.getElementById('usage-v-target').textContent = `${u.vMin.toFixed(1)} – ${u.vMax.toFixed(1)} m/s`;
        document.getElementById('usage-dba-target').textContent = `${u.dbaMin} – ${u.dbaMax} dBA`;
        document.getElementById('usage-met').textContent = `${u.met.toFixed(1)} met`;
    }

    function runCalculation() {
        const L = parseFloat(document.getElementById('room-length').value);
        const W = parseFloat(document.getElementById('room-width').value);
        const H = parseFloat(document.getElementById('room-height').value);
        const usage = usageSelect.value;
        const fanD = document.getElementById('fan-diameter').value ? parseFloat(document.getElementById('fan-diameter').value) : null;
        const coverageMode = coverageModeSelect.value;

        if (!L || !W || !H) return;

        const options = { coverageMode };

        let result = calculate(L, W, H, usage, fanD, options);

        if (result.error && fanD) {
            result = calculateDiagnostic(L, W, H, usage, fanD, options);
        }

        if (result.error) {
            placeholder.innerHTML = `
                <div class="placeholder-icon">⚠️</div>
                <p>${result.error}</p>
            `;
            placeholder.classList.remove('hidden');
            resultsContent.classList.add('hidden');
            return;
        }

        placeholder.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        displayResults(result);
        drawPlanView(result);
        drawSectionView(result);
    }

    function initLogoSpin() {
        if (!logoIcon || !logoImage || typeof logoImage.animate !== 'function') {
            return;
        }

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const animation = logoImage.animate(
            [
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(360deg)' },
            ],
            {
                duration: 12000,
                iterations: Infinity,
                easing: 'linear',
            }
        );

        let appliedPlaybackRate = 1;
        let currentPlaybackRate = 1;
        let targetPlaybackRate = 1;
        let playbackRateFrame = null;
        let lastPlaybackFrameTime = null;

        const setPlaybackRate = (rate) => {
            appliedPlaybackRate = rate;
            if (typeof animation.updatePlaybackRate === 'function') {
                animation.updatePlaybackRate(rate);
                return;
            }

            animation.playbackRate = rate;
        };

        const startPlaybackLoop = () => {
            if (playbackRateFrame !== null) {
                return;
            }

            lastPlaybackFrameTime = null;
            const step = (now) => {
                if (lastPlaybackFrameTime === null) {
                    lastPlaybackFrameTime = now;
                }

                const deltaSeconds = (now - lastPlaybackFrameTime) / 1000;
                lastPlaybackFrameTime = now;
                const accelerating = targetPlaybackRate > currentPlaybackRate;
                const timeConstant = accelerating ? 0.16 : 1.8;
                const alpha = 1 - Math.exp(-deltaSeconds / timeConstant);

                currentPlaybackRate += (targetPlaybackRate - currentPlaybackRate) * alpha;

                if (Math.abs(targetPlaybackRate - currentPlaybackRate) < 0.01) {
                    currentPlaybackRate = targetPlaybackRate;
                }

                setPlaybackRate(currentPlaybackRate);

                if (Math.abs(targetPlaybackRate - currentPlaybackRate) >= 0.01) {
                    playbackRateFrame = requestAnimationFrame(step);
                    return;
                }

                playbackRateFrame = null;
                lastPlaybackFrameTime = null;
            };

            playbackRateFrame = requestAnimationFrame(step);
        };

        const animatePlaybackRate = (targetRate) => {
            targetPlaybackRate = targetRate;
            currentPlaybackRate = appliedPlaybackRate;
            startPlaybackLoop();
        };

        setPlaybackRate(1);
        logoIcon.addEventListener('pointerenter', () => animatePlaybackRate(20));
        logoIcon.addEventListener('pointerleave', () => animatePlaybackRate(1));
    }
});

// ── Display Results ───────────────────────────────

function displayResults(r) {
    const isBedMode = r.coverageMode === 'bed-wall';
    const constraints = buildConstraintChecks(r);
    const hasFailures = constraints.some(c => c.status === 'fail');
    const explanationSection = document.getElementById('explanation-section');
    const shouldHideExplanation = Boolean(r.manualDiameterCm) && hasFailures;

    // Summary cards
    document.getElementById('result-num-fans').textContent = r.numFans;
    document.getElementById('result-diameter').textContent = r.dCm;
    document.getElementById('result-mounting').textContent = r.mountingType;
    document.getElementById('result-ce').textContent = `~${r.ceEstimate.toFixed(1)}`;

    // Animate cards
    document.querySelectorAll('.summary-card').forEach((card, i) => {
        card.classList.remove('animate-in');
        void card.offsetWidth; // Force reflow
        card.classList.add('animate-in');
    });

    // Constraints checklist
    const constraintsSection = document.getElementById('constraints-section');
    const constraintsList = document.getElementById('constraints-list');
    constraintsList.innerHTML = '';

    constraints.forEach(c => {
        const li = document.createElement('li');
        li.className = `constraint-item ${c.status}`;
        li.innerHTML = `
            <span class="constraint-icon">${c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}</span>
            <span class="constraint-label">${c.label} <span style="opacity:0.5">${c.detail}</span></span>
            <span class="constraint-value">${c.value}</span>
        `;
        constraintsList.appendChild(li);
    });

    constraintsSection.open = hasFailures;

    const explanation = document.getElementById('results-explanation');
    explanationSection.classList.toggle('hidden', shouldHideExplanation);
    explanation.innerHTML = shouldHideExplanation ? '' : buildResultExplanation(r);

    // Detailed metrics
    const metricsGrid = document.getElementById('metrics-grid');
    metricsGrid.innerHTML = '';
    const metrics = isBedMode ? [
        ['Mode', 'Zone de couchage contre un mur'],
        ['Surface pièce', `${(r.L * r.W).toFixed(1)} m²`],
        ['Zone ciblée', `${formatMeters(r.targetZoneRect.width)} × ${formatMeters(r.targetZoneRect.height)} m`],
        ['Hypothèse', 'Zone type contre un mur'],
        ['D calculé', `${r.dCm} cm`],
        ['D marché compatible', r.marketDiameterCm ? `${r.marketDiameterCm} cm` : 'Aucun standard disponible'],
        ['D min (FCC=0.2)', `${(r.dMinFCC * 100).toFixed(0)} cm`],
        ['D max (FCC=0.4)', `${(r.dMaxFCC * 100).toFixed(0)} cm`],
        ['D max global', `${(r.dMax * 100).toFixed(0)} cm`],
        ['Distance mur limitante', `${(r.distWall * 100).toFixed(0)} cm`],
        ['Centre ventilateur', `${formatMeters(r.fanPositions[0].x)} ; ${formatMeters(r.fanPositions[0].y)} m`],
        ['H montage', `${(r.hMontage * 100).toFixed(0)} cm`],
        ['H pales (sol)', `${(r.hPales * 100).toFixed(0)} cm`],
        ['V air estimée', `~${r.vAirEstimate.toFixed(2)} m/s`],
        ['Perf. montage', `${(r.mountingFactor * 100).toFixed(0)}%`],
    ] : [
        ['Surface pièce', `${(r.L * r.W).toFixed(1)} m²`],
        ['Nb cellules', `${r.nx} × ${r.ny} = ${r.numFans}`],
        ['Dim. cellule', `${r.cellL.toFixed(2)} × ${r.cellW.toFixed(2)} m`],
        ['Surface cellule', `${r.cellArea.toFixed(1)} m²`],
        ['D calculé', `${r.dCm} cm`],
        ['D marché compatible', r.marketDiameterCm ? `${r.marketDiameterCm} cm` : 'Aucun standard disponible'],
        ['D min (FCC=0.2)', `${(r.dMinFCC * 100).toFixed(0)} cm`],
        ['D max (FCC=0.4)', `${(r.dMaxFCC * 100).toFixed(0)} cm`],
        ['D max global', `${(r.dMax * 100).toFixed(0)} cm`],
        ['H montage', `${(r.hMontage * 100).toFixed(0)} cm`],
        ['H pales (sol)', `${(r.hPales * 100).toFixed(0)} cm`],
        ['V air estimée', `~${r.vAirEstimate.toFixed(2)} m/s`],
        ['Perf. montage', `${(r.mountingFactor * 100).toFixed(0)}%`],
    ];

    metrics.forEach(([label, value]) => {
        const div = document.createElement('div');
        div.className = 'metric-item';
        div.innerHTML = `
            <span class="metric-label">${label}</span>
            <span class="metric-value">${value}</span>
        `;
        metricsGrid.appendChild(div);
    });

    // Market diameters
    const marketGrid = document.getElementById('market-diameters');
    marketGrid.innerHTML = '';
    MARKET_DIAMETERS_CM.forEach(d => {
        const dm = d / 100;
        let cls = 'market-chip';
        if (d === r.marketDiameterCm) {
            cls += ' recommended';
        } else if (dm + EPSILON < r.dMinFCC) {
            cls += ' too-small';
        } else if (dm - EPSILON > r.dMax) {
            cls += ' too-big';
        }
        const chip = document.createElement('div');
        chip.className = cls;
        chip.textContent = `${d} cm`;
        if (d === r.marketDiameterCm) chip.textContent += ' ✓';
        marketGrid.appendChild(chip);
    });
}

function buildResultExplanation(r) {
    if (r.coverageMode === 'bed-wall') {
        return buildBedWallExplanation(r);
    }

    const roomFF = r.L / r.W;
    const positions = r.fanPositions
        .map((pos, index) => `brasseur ${index + 1} à ${formatMeters(pos.x)} m du mur gauche et ${formatMeters(pos.y)} m du mur haut`)
        .join(' ; ');

    const cellExplanation = r.numFans === 1
        ? `La pièce est traitée comme une seule cellule de ${formatMeters(r.cellL)} m x ${formatMeters(r.cellW)} m. Le ${buildTooltip('facteur de forme', FORM_FACTOR_TOOLTIP)} de la pièce est ${formatNumber(roomFF)}, ce qui reste compatible avec une implantation symétrique sans découpage supplémentaire.`
        : `La pièce de ${formatMeters(r.L)} m x ${formatMeters(r.W)} m est découpée en ${r.nx} x ${r.ny} cellules, soit ${r.numFans} zones identiques de ${formatMeters(r.cellL)} m x ${formatMeters(r.cellW)} m. Ce découpage ramène le ${buildTooltip('facteur de forme', FORM_FACTOR_TOOLTIP)} de ${formatNumber(roomFF)} à ${formatNumber(r.ffCell)} par cellule, ce qui rapproche l'implantation d'une configuration plus régulière.`;

    const placementExplanation = r.numFans === 1
        ? `Le brasseur est placé au centre de la pièce, à la position (${formatMeters(r.fanPositions[0].x)} m ; ${formatMeters(r.fanPositions[0].y)} m). Cette position centrée maximise la symétrie de diffusion et laisse ${formatMeters(r.distWall)} m jusqu'au mur le plus proche.`
        : `Chaque brasseur est placé au centre de sa cellule pour respecter la règle de symétrie. En lisant le plan de gauche à droite, cela donne : ${positions}. La distance au mur la plus faible vaut ${formatMeters(r.distWall)} m et l'entraxe minimal entre deux brasseurs vaut ${formatMeters(r.interDist)} m.`;

    const diameterExplanation = `Le diamètre calculé retenu par l'application est de ${r.dCm} cm. Pour cette surface à ventiler, un diamètre cohérent se situe ici entre ${(r.dMinFCC * 100).toFixed(0)} cm et ${(r.dMaxFCC * 100).toFixed(0)} cm. Le diamètre maximal global est de ${(r.dMax * 100).toFixed(0)} cm, limité principalement par ${describeLimitingConstraints(r)}.`;

    const marketExplanation = r.marketDiameterCm
        ? `Pour passer à un produit standard du marché sans dépasser les contraintes, le diamètre compatible le plus proche est ${r.marketDiameterCm} cm.`
        : `Aucun diamètre standard de la base marché ne rentre exactement dans l'enveloppe calculée. Il faut alors viser un modèle spécifique ou reprendre les hypothèses de découpage.`;

    const mountingExplanation = `Le montage retenu est ${buildMountingTooltip(r.mountingType)}. Le plan de rotation des pâles est positionné à ${(r.hPales * 100).toFixed(0)} cm du sol et à ${(r.hMontage * 100).toFixed(0)} cm sous le plafond. Cette implantation respecte la hauteur minimale de sécurité de ${(r.securityHeight * 100).toFixed(0)} cm et ${r.mountingType === 'Standard' ? 'conserve la distance de montage optimale de référence' : 'abaisse les pâles au plus bas autorisé pour préserver au mieux la performance'}.`;

    const performanceExplanation = `Avec cette configuration, l'application estime une vitesse d'air moyenne d'environ ${formatNumber(r.vAirEstimate)} m/s pour un effet rafraîchissant proche de ${formatNumber(r.ceEstimate)} °C. Le niveau de performance de montage retenu est de ${(r.mountingFactor * 100).toFixed(0)}%.`;

    return [
        cellExplanation,
        placementExplanation,
        diameterExplanation + ' ' + marketExplanation,
        mountingExplanation,
        performanceExplanation,
    ].map(paragraph => `<p>${paragraph}</p>`).join('');
}

function buildConstraintChecks(r) {
    const isBedMode = r.coverageMode === 'bed-wall';
    const hPalesDetail = r.D < 2.13 ? `≥ 213 cm` : `[max(3m; 0,8D) – 1,2D]`;
    const hMontageMinAllowed = r.hMontageMinAllowed || 0.25 * r.D;

    if (isBedMode) {
        return [
            {
                id: 'fcc',
                label: `FCC (zone ciblée)`,
                value: r.fcc.toFixed(2),
                status: (r.fcc >= 0.2 && r.fcc <= 0.4) ? 'pass' : 'fail',
                detail: `[0,20 – 0,40]`
            },
            {
                id: 'ff',
                label: `Allongement de la zone cible`,
                value: r.ffCell.toFixed(2),
                status: r.ffCell <= 1.41 ? 'pass' : 'warn',
                detail: `plus faible = plus enveloppant`
            },
            {
                id: 'wall',
                label: `Distance aux murs depuis le centre`,
                value: `${(r.distWall * 100).toFixed(0)} cm > ${r.dCm} cm`,
                status: r.wallOk ? 'pass' : 'fail',
                detail: `paroi la plus proche`
            },
            {
                id: 'local-mode',
                label: `Mode local assumé`,
                value: `${formatMeters(r.targetZoneRect.width)} × ${formatMeters(r.targetZoneRect.height)} m`,
                status: 'pass',
                detail: `1 seul ventilateur sur une zone type contre un mur`
            },
            {
                id: 'mounting',
                label: `Distance de montage`,
                value: `${(r.hMontage * 100).toFixed(0)} cm (${r.mountingType})`,
                status: r.hMontage + EPSILON >= hMontageMinAllowed ? 'pass' : 'fail',
                detail: `[0,25D – 0,35D]`
            },
            {
                id: 'blade-height',
                label: `Hauteur des pales`,
                value: `${(r.hPales * 100).toFixed(0)} cm`,
                status: r.hPalesOk ? 'pass' : 'fail',
                detail: hPalesDetail
            },
        ];
    }

    return [
        {
            id: 'fcc',
            label: `FCC (facteur de couverture)`,
            value: r.fcc.toFixed(2),
            status: (r.fcc >= 0.2 && r.fcc <= 0.4) ? 'pass' : 'fail',
            detail: `[0,20 – 0,40]`
        },
        {
            id: 'ff',
            label: `FF (facteur de forme cellule)`,
            value: r.ffCell.toFixed(2),
            status: r.ffCell < 1.41 ? 'pass' : 'fail',
            detail: `< 1,41 (√2)`
        },
        {
            id: 'wall',
            label: `Distance aux murs (P > D)`,
            value: `${(r.distWall * 100).toFixed(0)} cm > ${r.dCm} cm`,
            status: r.wallOk ? 'pass' : 'fail',
            detail: `P = ${(r.distWall).toFixed(2)} m`
        },
        {
            id: 'inter',
            label: `Distance inter-brasseurs (E > 2,5D)`,
            value: r.interDist ? `${(r.interDist * 100).toFixed(0)} cm > ${(2.5 * r.dCm).toFixed(0)} cm` : 'N/A (1 seul)',
            status: r.numFans === 1 ? 'pass' : r.interOk ? 'pass' : 'fail',
            detail: r.interDist ? `E = ${r.interDist.toFixed(2)} m` : ''
        },
        {
            id: 'mounting',
            label: `Distance de montage`,
            value: `${(r.hMontage * 100).toFixed(0)} cm (${r.mountingType})`,
            status: r.hMontage + EPSILON >= hMontageMinAllowed ? 'pass' : 'fail',
            detail: `[0,25D – 0,35D]`
        },
        {
            id: 'blade-height',
            label: `Hauteur des pales`,
            value: `${(r.hPales * 100).toFixed(0)} cm`,
            status: r.hPalesOk ? 'pass' : 'fail',
            detail: hPalesDetail
        },
    ];
}

function getConstraintFailureLabels(r) {
    return buildConstraintChecks(r)
        .filter(item => item.status === 'fail')
        .map(item => {
            switch (item.id) {
                case 'fcc':
                    return r.coverageMode === 'bed-wall'
                        ? 'Diamètre hors plage pour la zone ciblée'
                        : 'Diamètre hors plage pour la surface traitée';
                case 'ff':
                    return 'Cellule trop allongée';
                case 'wall':
                    return 'Distance au mur insuffisante';
                case 'inter':
                    return 'Entraxe insuffisant';
                case 'mounting':
                    return 'Distance de montage trop faible';
                case 'blade-height':
                    return 'Hauteur des pales insuffisante';
                default:
                    return item.label;
            }
        });
}

function buildBedWallExplanation(r) {
    const fanCenter = r.fanPositions[0];
    const performanceExplanation = `Avec cette configuration, l'application estime une vitesse d'air moyenne d'environ ${formatNumber(r.vAirEstimate)} m/s pour un effet rafraîchissant proche de ${formatNumber(r.ceEstimate)} °C. Le niveau de performance de montage retenu est de ${(r.mountingFactor * 100).toFixed(0)}%.`;

    return [
        `L'application est en mode confort local : elle ne cherche pas à ventiler uniformément toute la pièce, mais seulement la zone de couchage utile.`,
        `Ce mode applique une hypothèse simple de calcul : une zone type de ${formatMeters(r.targetZoneRect.width)} m x ${formatMeters(r.targetZoneRect.height)} m positionnée contre un mur, avec un seul ventilateur. Le schéma affiché est indicatif et sert uniquement au dimensionnement.`,
        `Un seul brasseur est donc retenu. Son centre de calcul est placé en (${formatMeters(fanCenter.x)} m ; ${formatMeters(fanCenter.y)} m) sur ce schéma type. La distance minimale à une paroi est de ${formatMeters(r.distWall)} m et la contrainte limitante est ${describeLimitingConstraints(r)}.`,
        `Le diamètre calculé est de ${r.dCm} cm. Pour cette zone type, un diamètre adapté se situe ici entre ${(r.dMinFCC * 100).toFixed(0)} cm et ${(r.dMaxFCC * 100).toFixed(0)} cm. Si l'on bascule sur un diamètre standard du marché sans dépasser les contraintes, le plus grand diamètre compatible est ${r.marketDiameterCm ? `${r.marketDiameterCm} cm` : 'non disponible dans la base actuelle'}.`,
        `Le montage retenu est ${buildMountingTooltip(r.mountingType)}. Les pâles sont positionnées à ${(r.hPales * 100).toFixed(0)} cm du sol et à ${(r.hMontage * 100).toFixed(0)} cm sous le plafond. ${r.mountingType === 'Standard' ? 'La retombée reste dans la plage optimale.' : 'Comme le standard n\'est pas atteignable, l\'app place les pâles au plus bas autorisé pour conserver un bon brassage.'} Cette estimation est calculée sur la zone ciblée.`,
        performanceExplanation,
    ].map(paragraph => `<p>${paragraph}</p>`).join('');
}

function describeLimitingConstraints(r) {
    const constraints = [
        { label: r.coverageMode === 'bed-wall' ? 'la taille de la zone à ventiler' : 'la taille de la surface à ventiler', value: r.dMaxFCC },
        { label: 'la distance aux murs', value: r.dMaxWall },
        { label: 'la distance entre brasseurs', value: r.dMaxInter },
        { label: 'la hauteur disponible', value: r.dMaxHeight },
    ].filter(item => Number.isFinite(item.value));

    const minValue = Math.min(...constraints.map(item => item.value));
    const active = constraints
        .filter(item => Math.abs(item.value - minValue) < 1e-6)
        .map(item => item.label);

    if (active.length === 1) return active[0];
    return active.join(' et ');
}

function formatNumber(value) {
    return value.toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1').replace('.', ',');
}

function formatMeters(value) {
    return formatNumber(value);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildTooltip(text, tooltip) {
    return `<span class="tooltip-term" tabindex="0" data-tooltip="${escapeHtml(tooltip)}">${escapeHtml(text)}</span>`;
}

function buildMountingTooltip(mountingType) {
    const tooltip = MOUNTING_TOOLTIPS[mountingType];
    return tooltip ? buildTooltip(mountingType, tooltip) : escapeHtml(mountingType);
}

// ── Canvas Drawing: Plan View ─────────────────────

function drawPlanView(r) {
    const canvas = document.getElementById('canvas-plan');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Canvas sizing
    const displayW = canvas.parentElement.clientWidth - 24;
    const displayH = Math.min(500, displayW * (r.W / r.L) + 120);
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#12141e';
    ctx.fillRect(0, 0, displayW, displayH);

    // Margins for dimension labels
    const margin = { top: 40, right: 40, bottom: 50, left: 50 };
    const drawW = displayW - margin.left - margin.right;
    const drawH = displayH - margin.top - margin.bottom;

    // Scale to fit room
    const scale = Math.min(drawW / r.L, drawH / r.W);
    const roomPxW = r.L * scale;
    const roomPxH = r.W * scale;
    const offsetX = margin.left + (drawW - roomPxW) / 2;
    const offsetY = margin.top + (drawH - roomPxH) / 2;
    const failedConstraintIds = new Set(buildConstraintChecks(r).filter(item => item.status === 'fail').map(item => item.id));
    const issueLabels = getConstraintFailureLabels(r);

    // Helper: room coords to canvas coords
    const toCanvasX = (x) => offsetX + x * scale;
    const toCanvasY = (y) => offsetY + y * scale;

    // ── Draw room outline ──
    ctx.strokeStyle = '#3a3f5a';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#181c2a';
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, roomPxW, roomPxH);
    ctx.fill();
    ctx.stroke();

    if (r.coverageMode === 'bed-wall') {
        const zone = r.targetZoneRect;

        ctx.fillStyle = failedConstraintIds.has('fcc') ? 'rgba(255, 107, 107, 0.08)' : 'rgba(91, 140, 255, 0.10)';
        ctx.strokeStyle = failedConstraintIds.has('fcc') ? 'rgba(255, 107, 107, 0.55)' : 'rgba(91, 140, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(toCanvasX(zone.x), toCanvasY(zone.y), zone.width * scale, zone.height * scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(91, 140, 255, 0.9)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Zone ciblée', toCanvasX(zone.x) + 6, toCanvasY(zone.y) + 14);
    } else {
        ctx.strokeStyle = 'rgba(74, 232, 160, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);

        for (let ix = 1; ix < r.nx; ix++) {
            const x = toCanvasX(ix * r.cellL);
            ctx.beginPath();
            ctx.moveTo(x, offsetY);
            ctx.lineTo(x, offsetY + roomPxH);
            ctx.stroke();
        }
        for (let iy = 1; iy < r.ny; iy++) {
            const y = toCanvasY(iy * r.cellW);
            ctx.beginPath();
            ctx.moveTo(offsetX, y);
            ctx.lineTo(offsetX + roomPxW, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    // ── Draw fans ──
    r.fanPositions.forEach((pos, idx) => {
        const cx = toCanvasX(pos.x);
        const cy = toCanvasY(pos.y);
        const radius = (r.D / 2) * scale;

        // Influence zone (large circle)
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(74, 232, 160, 0.06)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(74, 232, 160, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        if (failedConstraintIds.has('fcc')) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 107, 107, 0.08)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 107, 107, 0.65)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Fan blades (stylized)
        drawFanIcon(ctx, cx, cy, radius * 0.6);

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = failedConstraintIds.has('fcc') ? '#ff6b6b' : '#4ae8a0';
        ctx.fill();
    });

    // ── Dimension annotations ──
    ctx.fillStyle = '#9398a8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Room length (top)
    drawDimension(ctx, offsetX, offsetY - 18, offsetX + roomPxW, offsetY - 18, `${r.L.toFixed(2)} m`, '#9398a8');

    // Room width (left)
    drawDimensionVertical(ctx, offsetX - 18, offsetY, offsetX - 18, offsetY + roomPxH, `${r.W.toFixed(2)} m`, '#9398a8');

    // Cell dimensions (if multiple cells)
    if (r.coverageMode !== 'bed-wall' && (r.nx > 1 || r.ny > 1)) {
        const cellPxW = r.cellL * scale;
        const cellPxH = r.cellW * scale;
        
        // Cell length (bottom of first cell)
        if (r.nx > 1) {
            drawDimension(ctx, offsetX, offsetY + roomPxH + 20, offsetX + cellPxW, offsetY + roomPxH + 20, `${r.cellL.toFixed(2)} m`, 'rgba(74, 232, 160, 0.6)');
        }
        // Cell width (right of first cell)
        if (r.ny > 1) {
            drawDimensionVertical(ctx, offsetX + roomPxW + 20, offsetY, offsetX + roomPxW + 20, offsetY + cellPxH, `${r.cellW.toFixed(2)} m`, 'rgba(74, 232, 160, 0.6)');
        }
    }

    // ── Distance P annotation (first fan to nearest wall) ──
    if (r.fanPositions.length > 0) {
        const fp = r.fanPositions[0];
        const cx = toCanvasX(fp.x);
        const cy = toCanvasY(fp.y);
        const wallCandidates = [
            { dist: fp.x, x: offsetX, y: cy },
            { dist: r.L - fp.x, x: offsetX + roomPxW, y: cy },
            { dist: fp.y, x: cx, y: offsetY },
            { dist: r.W - fp.y, x: cx, y: offsetY + roomPxH },
        ];
        wallCandidates.sort((a, b) => a.dist - b.dist);
        const nearest = wallCandidates[0];
        const wallColor = failedConstraintIds.has('wall') ? 'rgba(255, 107, 107, 0.9)' : 'rgba(255, 159, 67, 0.8)';

        ctx.strokeStyle = wallColor;
        ctx.lineWidth = failedConstraintIds.has('wall') ? 2 : 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nearest.x, nearest.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = wallColor;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`P=${(nearest.dist * 100).toFixed(0)}cm`, (cx + nearest.x) / 2 + 5, (cy + nearest.y) / 2);
    }

    if (failedConstraintIds.has('inter') && r.fanPositions.length > 1) {
        const pair = findClosestFanPair(r.fanPositions);
        if (pair) {
            const start = r.fanPositions[pair.first];
            const end = r.fanPositions[pair.second];
            const x1 = toCanvasX(start.x);
            const y1 = toCanvasY(start.y);
            const x2 = toCanvasX(end.x);
            const y2 = toCanvasY(end.y);

            ctx.strokeStyle = 'rgba(255, 107, 107, 0.9)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`E=${(pair.distance * 100).toFixed(0)}cm`, (x1 + x2) / 2, (y1 + y2) / 2 - 8);
        }
    }

    drawDiagnosticBadges(ctx, issueLabels, offsetX + 8, offsetY + 8);
}

function drawFanIcon(ctx, cx, cy, size) {
    const blades = 4;
    const bladeLen = size;
    
    ctx.save();
    ctx.translate(cx, cy);
    
    for (let i = 0; i < blades; i++) {
        const angle = (i / blades) * Math.PI * 2 - Math.PI / 4;
        ctx.save();
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(bladeLen * 0.3, -bladeLen * 0.15, bladeLen * 0.8, -bladeLen * 0.05);
        ctx.quadraticCurveTo(bladeLen, 0, bladeLen * 0.8, bladeLen * 0.08);
        ctx.quadraticCurveTo(bladeLen * 0.3, bladeLen * 0.1, 0, 0);
        
        ctx.fillStyle = 'rgba(74, 232, 160, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(74, 232, 160, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
    
    ctx.restore();
}

function drawDimension(ctx, x1, y1, x2, y2, label, color) {
    const arrowSize = 4;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Line
    ctx.beginPath();
    ctx.moveTo(x1 + arrowSize, y1);
    ctx.lineTo(x2 - arrowSize, y2);
    ctx.stroke();

    // Arrows
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize + 2, y1 - 3);
    ctx.lineTo(x1 + arrowSize + 2, y1 + 3);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize - 2, y2 - 3);
    ctx.lineTo(x2 - arrowSize - 2, y2 + 3);
    ctx.fill();

    // Tick marks
    ctx.beginPath();
    ctx.moveTo(x1, y1 - 6);
    ctx.lineTo(x1, y1 + 6);
    ctx.moveTo(x2, y2 - 6);
    ctx.lineTo(x2, y2 + 6);
    ctx.stroke();

    // Label
    ctx.fillText(label, (x1 + x2) / 2, y1 - 6);
}

function drawDimensionVertical(ctx, x1, y1, x2, y2, label, color) {
    const arrowSize = 4;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;

    // Line
    ctx.beginPath();
    ctx.moveTo(x1, y1 + arrowSize);
    ctx.lineTo(x2, y2 - arrowSize);
    ctx.stroke();

    // Arrows
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 3, y1 + arrowSize + 2);
    ctx.lineTo(x1 + 3, y1 + arrowSize + 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 3, y2 - arrowSize - 2);
    ctx.lineTo(x2 + 3, y2 - arrowSize - 2);
    ctx.fill();

    // Tick marks
    ctx.beginPath();
    ctx.moveTo(x1 - 6, y1);
    ctx.lineTo(x1 + 6, y1);
    ctx.moveTo(x2 - 6, y2);
    ctx.lineTo(x2 + 6, y2);
    ctx.stroke();

    // Label (rotated)
    ctx.save();
    ctx.translate(x1 - 8, (y1 + y2) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, 0);
    ctx.restore();
}

// ── Canvas Drawing: Section View ──────────────────

function drawSectionView(r) {
    const canvas = document.getElementById('canvas-section');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const displayW = canvas.parentElement.clientWidth - 24;
    const displayH = Math.min(400, displayW * 0.55);
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#12141e';
    ctx.fillRect(0, 0, displayW, displayH);

    const margin = { top: 30, right: 80, bottom: 30, left: 80 };
    const drawW = displayW - margin.left - margin.right;
    const drawH = displayH - margin.top - margin.bottom;

    // Scale: horizontal = room width (smaller dim), vertical = HSP
    const roomWidth = Math.min(r.L, r.W);
    const hScale = drawW / roomWidth;
    const vScale = drawH / r.HSP;
    const scale = Math.min(hScale, vScale);

    const roomPxW = roomWidth * scale;
    const roomPxH = r.HSP * scale;
    const offsetX = margin.left + (drawW - roomPxW) / 2;
    const offsetY = margin.top + (drawH - roomPxH) / 2;
    const failedConstraintIds = new Set(buildConstraintChecks(r).filter(item => item.status === 'fail').map(item => item.id));
    const issueLabels = getConstraintFailureLabels(r);

    // Room outline
    ctx.strokeStyle = '#3a3f5a';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#181c2a';
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, roomPxW, roomPxH);
    ctx.fill();
    ctx.stroke();

    // Floor
    ctx.fillStyle = '#2a2e42';
    ctx.fillRect(offsetX, offsetY + roomPxH - 4, roomPxW, 4);

    // Ceiling
    ctx.fillStyle = '#2a2e42';
    ctx.fillRect(offsetX, offsetY, roomPxW, 4);

    // ── Fan position in section ──
    const fanCenterX = offsetX + roomPxW / 2;
    const hMontPx = r.hMontage * scale;
    const hPalesPx = r.hPales * scale;
    const fanY = offsetY + hMontPx;
    const fanRadius = (r.D / 2) * scale;
    const mountingColor = failedConstraintIds.has('mounting') ? 'rgba(255, 107, 107, 0.9)' : '#5c6178';
    const bladeColor = failedConstraintIds.has('blade-height') ? 'rgba(255, 107, 107, 0.85)' : 'rgba(74, 232, 160, 0.6)';
    const diameterColor = failedConstraintIds.has('fcc') ? 'rgba(255, 107, 107, 0.9)' : 'rgba(74, 232, 160, 0.6)';

    // Mounting rod
    ctx.strokeStyle = mountingColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fanCenterX, offsetY + 4);
    ctx.lineTo(fanCenterX, fanY);
    ctx.stroke();

    // Fan body
    ctx.fillStyle = '#3a3f5a';
    ctx.beginPath();
    ctx.arc(fanCenterX, fanY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Blades
    ctx.strokeStyle = bladeColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fanCenterX - fanRadius, fanY + 2);
    ctx.lineTo(fanCenterX + fanRadius, fanY + 2);
    ctx.stroke();
    ctx.lineCap = 'butt';

    // Blade tips
    ctx.fillStyle = bladeColor;
    ctx.beginPath();
    ctx.arc(fanCenterX - fanRadius, fanY + 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fanCenterX + fanRadius, fanY + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // ── Air flow arrows ──
    ctx.strokeStyle = 'rgba(91, 140, 255, 0.2)';
    ctx.lineWidth = 1;
    const arrowCount = 5;
    for (let i = 0; i < arrowCount; i++) {
        const t = (i + 1) / (arrowCount + 1);
        const ax = fanCenterX - fanRadius + t * 2 * fanRadius;
        const ay1 = fanY + 10;
        const ay2 = fanY + 10 + hPalesPx * 0.4;
        drawArrowDown(ctx, ax, ay1, ay2);
    }

    // ── Dimension annotations ──

    // HSP (left side)
    drawDimensionVertical(ctx, offsetX - 25, offsetY, offsetX - 25, offsetY + roomPxH, `HSP ${r.HSP.toFixed(2)} m`, '#9398a8');

    // H_montage (right side, ceiling to fan)
    if (hMontPx > 15) {
        drawDimensionVertical(ctx, offsetX + roomPxW + 25, offsetY, offsetX + roomPxW + 25, fanY, `${(r.hMontage * 100).toFixed(0)} cm`, failedConstraintIds.has('mounting') ? '#ff6b6b' : '#ff9f43');
    }

    // H_pales (right side, fan to floor)
    drawDimensionVertical(ctx, offsetX + roomPxW + 55, fanY, offsetX + roomPxW + 55, offsetY + roomPxH, `${(r.hPales * 100).toFixed(0)} cm`, failedConstraintIds.has('blade-height') ? '#ff6b6b' : '#4ae8a0');

    // Diameter (under fan)
    const dLabelY = fanY + 20;
    drawDimension(ctx, fanCenterX - fanRadius, dLabelY, fanCenterX + fanRadius, dLabelY, `D=${r.dCm} cm`, diameterColor);

    // ── Labels ──
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Mounting type label
    let mountColor = '#4ae8a0';
    if (r.mountingType === 'Low-profile') mountColor = '#ff9f43';
    if (r.mountingType !== 'Standard' && r.mountingType !== 'Low-profile') mountColor = '#ff6b6b';
    ctx.fillStyle = mountColor;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`Montage ${r.mountingType}`, fanCenterX, fanY - 15);

    // Security line
    const secY = offsetY + roomPxH - r.securityHeight * scale;
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(offsetX, secY);
    ctx.lineTo(offsetX + roomPxW, secY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (failedConstraintIds.has('blade-height')) {
        ctx.fillStyle = 'rgba(255, 107, 107, 0.08)';
        ctx.fillRect(offsetX, secY, roomPxW, offsetY + roomPxH - secY);
    }

    ctx.fillStyle = 'rgba(255, 107, 107, 0.5)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Sécurité: ${(r.securityHeight * 100).toFixed(0)} cm`, offsetX + 5, secY - 4);

    // Floor / Ceiling labels
    ctx.fillStyle = '#5c6178';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Plafond', offsetX + roomPxW / 2, offsetY - 8);
    ctx.fillText('Sol', offsetX + roomPxW / 2, offsetY + roomPxH + 16);

    drawDiagnosticBadges(ctx, issueLabels, offsetX + 8, offsetY + 8);
}

function findClosestFanPair(fanPositions) {
    if (!fanPositions || fanPositions.length < 2) {
        return null;
    }

    let closest = null;
    for (let first = 0; first < fanPositions.length; first++) {
        for (let second = first + 1; second < fanPositions.length; second++) {
            const dx = fanPositions[first].x - fanPositions[second].x;
            const dy = fanPositions[first].y - fanPositions[second].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (!closest || distance < closest.distance) {
                closest = { first, second, distance };
            }
        }
    }

    return closest;
}

function drawDiagnosticBadges(ctx, labels, startX, startY) {
    if (!labels.length) {
        return;
    }

    ctx.save();
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    labels.forEach((label, index) => {
        const textWidth = ctx.measureText(label).width;
        const x = startX;
        const y = startY + index * 24;
        const width = textWidth + 20;
        const height = 18;

        ctx.fillStyle = 'rgba(255, 107, 107, 0.15)';
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 214, 214, 0.95)';
        ctx.fillText(label, x + 10, y + 4);
    });

    ctx.restore();
}

function drawArrowDown(ctx, x, y1, y2) {
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y2);
    ctx.lineTo(x - 3, y2 - 5);
    ctx.moveTo(x, y2);
    ctx.lineTo(x + 3, y2 - 5);
    ctx.stroke();
}
