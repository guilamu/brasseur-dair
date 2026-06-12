/* =============================================
   BRASSE — Ceiling Fan Placement Engine
   ============================================= */

// ── Constants ──────────────────────────────────────
const MARKET_DIAMETERS_CM = [70, 80, 90, 103, 107, 112, 122, 127, 132, 142, 152, 166];
const EPSILON = 1e-9;
function getFormFactorTooltip() {
    return window.I18n.t('form_factor_tooltip');
}
function getMountingTooltip(mountingType) {
    switch (mountingType) {
        case 'Standard': return window.I18n.t('mounting_tooltip_standard');
        case 'Low-profile': return window.I18n.t('mounting_tooltip_low_profile');
        case 'Flush': return window.I18n.t('mounting_tooltip_flush');
        default: return '';
    }
}

const USAGE_DATA = {
    chambre:  { label: "usage_chambre",            met: 0.8,  vMin: 0.4, vMax: 0.6, dbaMin: 18, dbaMax: 30 },
    sejour:   { label: "usage_sejour",             met: 1.1,  vMin: 0.6, vMax: 0.8, dbaMin: 24, dbaMax: 34 },
    bureau:   { label: "usage_bureau",             met: 1.15, vMin: 0.8, vMax: 1.0, dbaMin: 26, dbaMax: 42 },
    scolaire: { label: "usage_scolaire",           met: 1.3,  vMin: 0.8, vMax: 1.3, dbaMin: 32, dbaMax: 42 },
    sport:    { label: "usage_sport",              met: 1.5,  vMin: 1.3, vMax: 2.0, dbaMin: 38, dbaMax: 48 },
};

// Approximate CE (°C) for given air speed (m/s)
// Based on BRASSE conditions: T=28°C, HR=60%, met=1.1, clo=0.5
function estimateCE(vAir) {
    if (vAir <= 0) return 0;
    // Logarithmic fit from the SURYA data
    return Math.min(7, 1.5 + 2.8 * Math.log(1 + vAir * 2));
}

// ── Main Calculation Engine ───────────────────────

function calculate(roomL, roomW, HSP, usage, userDiameterCm, options = {}) {
    const targetFanCount = options.targetFanCount || null;
    return calculateUniformMode(roomL, roomW, HSP, usage, userDiameterCm, targetFanCount);
}

function calculateDiagnostic(roomL, roomW, HSP, usage, userDiameterCm, options = {}) {
    if (!userDiameterCm) {
        return { error: window.I18n.t('error_no_manual_diameter') };
    }

    const targetFanCount = options.targetFanCount || null;
    return calculateUniformDiagnosticMode(roomL, roomW, HSP, usage, userDiameterCm, targetFanCount);
}

function calculateUniformMode(roomL, roomW, HSP, usage, userDiameterCm, targetFanCount = null) {
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
            if (targetFanCount !== null && nx * ny !== targetFanCount) continue;

            const cellL = L / nx;
            const cellW = W / ny;
            const cellArea = cellL * cellW;
            const sqrtArea = Math.sqrt(cellArea);
            const ffCell = Math.max(cellL, cellW) / Math.min(cellL, cellW);

            // Skip configurations that violate shape or size guidelines
            // When targetFanCount is set, relax FF constraint (penalize instead of skip)
            if (targetFanCount === null && ffCell >= 1.41) continue;
            if (nx * ny > 12) continue;
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
            const mountingBonus = mounting.mountingType === "Standard" ? 200 : 0;
            let ffPenalty = 0;
            if (ffCell >= 1.41) {
                ffPenalty = -(ffCell - 1.41) * 500;
            }
            const score = mountingBonus + D * 1000 + (2 - ffCell) * 50 - (nx * ny) * 10 + ffPenalty;

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
        return { error: window.I18n.t('error_no_config_found') };
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

function calculateUniformDiagnosticMode(roomL, roomW, HSP, usage, userDiameterCm, targetFanCount = null) {
    const L = Math.max(roomL, roomW);
    const W = Math.min(roomL, roomW);
    const usageData = USAGE_DATA[usage];
    const userD = userDiameterCm / 100;

    let bestConfig = null;
    let bestScore = -Infinity;

    for (let nx = 1; nx <= 6; nx++) {
        for (let ny = 1; ny <= 6; ny++) {
            if (targetFanCount !== null && nx * ny !== targetFanCount) continue;

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
        return { error: window.I18n.t('error_no_diagnostic_possible') };
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

function finalizeResult(config, usageData) {
    config.usage = usageData;

    // Estimate performance
    const vAirEstimate = usageData.vMin + (usageData.vMax - usageData.vMin) * Math.min(1, config.fcc / 0.4) * config.mountingFactor;
    config.vAirEstimate = vAirEstimate;
    config.ceEstimate = estimateCE(vAirEstimate);
    return config;
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
    window.I18n.init();
    const form = document.getElementById('calc-form');
    const logoIcon = document.querySelector('.logo-icon');
    const logoImage = logoIcon ? logoIcon.querySelector('img') : null;
    const usageSelect = document.getElementById('room-usage');
    const fanCountSelect = document.getElementById('fan-count');
    const fanCountHint = document.getElementById('fan-count-hint');
    const placeholder = document.getElementById('results-placeholder');
    const resultsContent = document.getElementById('results-content');

    let currentOptimalFanCount = null;

    initThemeToggle();
    initLogoSpin();

    window.addEventListener('languagechange', () => {
        updateUsageInfo();
        if (form.checkValidity()) {
            runCalculation();
        }
    });

    window.addEventListener('unitchange', () => {
        updateInputBounds();
        updateUsageInfo();
        if (form.checkValidity()) {
            runCalculation();
        }
    });

    // Update usage info card on change
    usageSelect.addEventListener('change', () => {
        updateUsageInfo();
    });
    updateInputBounds();
    updateUsageInfo();

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

    function updateFanCountOptions(newOptimalCount) {
        if (newOptimalCount === currentOptimalFanCount) return;

        currentOptimalFanCount = newOptimalCount;
        fanCountSelect.innerHTML = '';

        for (let i = newOptimalCount; i >= 1; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i === newOptimalCount
                ? window.I18n.format(window.I18n.t('fan_count_recommended'), i)
                : `${i}`;
            fanCountSelect.appendChild(option);
        }

        // Always default to recommended
        fanCountSelect.value = newOptimalCount;
    }

    function updateFanCountHint(result) {
        const selected = parseInt(fanCountSelect.value);
        if (selected === currentOptimalFanCount) {
            fanCountHint.textContent = window.I18n.format(window.I18n.t('fan_count_hint_optimal'), currentOptimalFanCount, result.dCm);
        } else {
            const ffWarning = result.ffCell >= 1.41
                ? window.I18n.format(window.I18n.t('fan_count_warning_ff'), result.ffCell.toFixed(2))
                : '';
            fanCountHint.textContent = window.I18n.format(window.I18n.t('fan_count_hint_reduced'), selected, result.dCm, ffWarning);
        }
    }

    function updateUsageInfo() {
        const u = USAGE_DATA[usageSelect.value];
        document.getElementById('usage-info-title').textContent = window.I18n.t(u.label);
        if (window.I18n.unit === 'imperial') {
            document.getElementById('usage-v-target').textContent = `${Math.round(u.vMin * 196.85)} – ${Math.round(u.vMax * 196.85)} fpm`;
        } else {
            document.getElementById('usage-v-target').textContent = `${u.vMin.toFixed(1)} – ${u.vMax.toFixed(1)} m/s`;
        }
        document.getElementById('usage-dba-target').textContent = `${u.dbaMin} – ${u.dbaMax} dBA`;
        document.getElementById('usage-met').textContent = `${u.met.toFixed(1)} met`;
    }

    function updateInputBounds() {
        const isImperial = window.I18n.unit === 'imperial';
        
        const lengthInput = document.getElementById('room-length');
        const widthInput = document.getElementById('room-width');
        const heightInput = document.getElementById('room-height');
        const diameterInput = document.getElementById('fan-diameter');

        if (isImperial) {
            if (lengthInput.value && lengthInput.dataset.unitSys !== 'imperial') {
                lengthInput.value = (parseFloat(lengthInput.value) * 3.28084).toFixed(1);
            }
            if (widthInput.value && widthInput.dataset.unitSys !== 'imperial') {
                widthInput.value = (parseFloat(widthInput.value) * 3.28084).toFixed(1);
            }
            if (heightInput.value && heightInput.dataset.unitSys !== 'imperial') {
                heightInput.value = (parseFloat(heightInput.value) * 3.28084).toFixed(1);
            }
            if (diameterInput.value && diameterInput.dataset.unitSys !== 'imperial') {
                diameterInput.value = Math.round(parseFloat(diameterInput.value) / 2.54);
            }

            lengthInput.min = "3.3"; lengthInput.max = "164"; lengthInput.step = "0.1";
            widthInput.min = "3.3"; widthInput.max = "164"; widthInput.step = "0.1";
            heightInput.min = "6.6"; heightInput.max = "65"; heightInput.step = "0.1";
            diameterInput.min = "16"; diameterInput.max = "120"; diameterInput.step = "1";
            
            lengthInput.dataset.unitSys = 'imperial';
            widthInput.dataset.unitSys = 'imperial';
            heightInput.dataset.unitSys = 'imperial';
            diameterInput.dataset.unitSys = 'imperial';
        } else {
            if (lengthInput.value && lengthInput.dataset.unitSys === 'imperial') {
                lengthInput.value = (parseFloat(lengthInput.value) / 3.28084).toFixed(2);
            }
            if (widthInput.value && widthInput.dataset.unitSys === 'imperial') {
                widthInput.value = (parseFloat(widthInput.value) / 3.28084).toFixed(2);
            }
            if (heightInput.value && heightInput.dataset.unitSys === 'imperial') {
                heightInput.value = (parseFloat(heightInput.value) / 3.28084).toFixed(2);
            }
            if (diameterInput.value && diameterInput.dataset.unitSys === 'imperial') {
                diameterInput.value = Math.round(parseFloat(diameterInput.value) * 2.54);
            }

            lengthInput.min = "1"; lengthInput.max = "50"; lengthInput.step = "0.01";
            widthInput.min = "1"; widthInput.max = "50"; widthInput.step = "0.01";
            heightInput.min = "2"; heightInput.max = "20"; heightInput.step = "0.01";
            diameterInput.min = "40"; diameterInput.max = "300"; diameterInput.step = "1";

            lengthInput.dataset.unitSys = 'metric';
            widthInput.dataset.unitSys = 'metric';
            heightInput.dataset.unitSys = 'metric';
            diameterInput.dataset.unitSys = 'metric';
        }
    }

    function runCalculation() {
        let L = parseFloat(document.getElementById('room-length').value);
        let W = parseFloat(document.getElementById('room-width').value);
        let H = parseFloat(document.getElementById('room-height').value);
        const usage = usageSelect.value;
        let fanD = document.getElementById('fan-diameter').value ? parseFloat(document.getElementById('fan-diameter').value) : null;

        if (!L || !W || !H) return;

        // Convert inputs from Imperial to Metric if necessary before calculations
        const isImperial = window.I18n.unit === 'imperial';
        if (isImperial) {
            L = L / 3.28084;
            W = W / 3.28084;
            H = H / 3.28084;
            if (fanD !== null) {
                fanD = fanD * 2.54;
            }
        }

        // Phase 1: Calculate optimal (no constraints) to get the reference fan count
        const optimalResult = calculate(L, W, H, usage, null);

        if (optimalResult.error) {
            placeholder.innerHTML = `
                <div class="placeholder-icon">⚠️</div>
                <p>${optimalResult.error}</p>
            `;
            placeholder.classList.remove('hidden');
            resultsContent.classList.add('hidden');
            return;
        }

        updateFanCountOptions(optimalResult.numFans);

        // Phase 2: Calculate with user constraints (fan count + optional manual diameter)
        const selectedCount = parseInt(fanCountSelect.value);
        const isReduced = !isNaN(selectedCount) && selectedCount < optimalResult.numFans;
        const options = {};
        if (isReduced) {
            options.targetFanCount = selectedCount;
        }

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

        result.optimalFanCount = optimalResult.numFans;
        result.isReducedFanCount = isReduced;

        placeholder.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        updateFanCountHint(result);
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

    function initThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        const icon = toggleBtn ? toggleBtn.querySelector('.theme-icon') : null;
        if (!toggleBtn || !icon) return;

        const saved = localStorage.getItem('brasse-theme');
        if (saved === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            icon.textContent = '☀️';
        }

        toggleBtn.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('brasse-theme', 'dark');
                icon.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('brasse-theme', 'light');
                icon.textContent = '☀️';
            }
            // Redraw canvases with new theme colors
            if (form.checkValidity()) {
                runCalculation();
            }
        });
    }
});

// ── Display Results ───────────────────────────────

function displayResults(r) {
    const constraints = buildConstraintChecks(r);
    const hasFailures = constraints.some(c => c.status === 'fail');
    const explanationSection = document.getElementById('explanation-section');
    const shouldHideExplanation = Boolean(r.manualDiameterCm) && hasFailures;

    // Summary cards
    document.getElementById('result-num-fans').textContent = r.numFans;
    document.getElementById('result-diameter').textContent = formatDiameter(r.dCm, false);
    document.getElementById('result-mounting').textContent = window.I18n.t(r.mountingType);
    document.getElementById('result-ce').textContent = `~${formatTempDiff(r.ceEstimate, false)}`;

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
            <span class="constraint-label">${window.I18n.t(c.labelKey)} <span style="opacity:0.5">${c.detail}</span></span>
            <span class="constraint-value">${c.value}</span>
        `;
        constraintsList.appendChild(li);
    });

    constraintsSection.open = hasFailures;

    const explanation = document.getElementById('results-explanation');
    explanationSection.classList.toggle('hidden', shouldHideExplanation);
    explanation.innerHTML = shouldHideExplanation ? '' : buildResultExplanation(r);

    // Detailed metrics
    const isImperial = window.I18n.unit === 'imperial';
    const metricsGrid = document.getElementById('metrics-grid');
    metricsGrid.innerHTML = '';
    const metrics = [
        [window.I18n.t('metric_room_area'), isImperial ? `${(r.L * r.W * 10.7639).toFixed(0)} sq ft` : `${(r.L * r.W).toFixed(1)} m²`],
        [window.I18n.t('metric_cell_count'), `${r.nx} × ${r.ny} = ${r.numFans}`],
        [window.I18n.t('metric_cell_dim'), isImperial ? `${(r.cellL * 3.28084).toFixed(1)} × ${(r.cellW * 3.28084).toFixed(1)} ft` : `${r.cellL.toFixed(2)} × ${r.cellW.toFixed(2)} m`],
        [window.I18n.t('metric_cell_area'), isImperial ? `${(r.cellArea * 10.7639).toFixed(0)} sq ft` : `${r.cellArea.toFixed(1)} m²`],
        [window.I18n.t('metric_d_ideal'), formatDiameter(r.dCm)],
        [window.I18n.t('metric_d_range'), isImperial ? `${Math.ceil(r.dMinFCC * 39.37)} – ${Math.floor(r.dMax * 39.37)} in` : `${Math.ceil(r.dMinFCC * 100)} – ${Math.floor(r.dMax * 100)} cm`],
        [window.I18n.t('metric_d_min'), isImperial ? `${(r.dMinFCC * 39.37).toFixed(0)} in` : `${(r.dMinFCC * 100).toFixed(0)} cm`],
        [window.I18n.t('metric_d_max_fcc'), isImperial ? `${(r.dMaxFCC * 39.37).toFixed(0)} in` : `${(r.dMaxFCC * 100).toFixed(0)} cm`],
        [window.I18n.t('metric_d_max_global'), isImperial ? `${(r.dMax * 39.37).toFixed(0)} in` : `${(r.dMax * 100).toFixed(0)} cm`],
        [window.I18n.t('metric_h_mounting'), formatHeight(r.hMontage)],
        [window.I18n.t('metric_h_blades'), formatHeight(r.hPales)],
        [window.I18n.t('metric_v_air'), formatSpeed(r.vAirEstimate)],
        [window.I18n.t('metric_mounting_perf'), `${(r.mountingFactor * 100).toFixed(0)}%`],
    ];

    if (r.isReducedFanCount) {
        metrics.unshift([window.I18n.t('metric_user_choice'), `${r.numFans} / ${r.optimalFanCount} ${window.I18n.t('metric_optimal')}`]);
    }

    metrics.forEach(([label, value]) => {
        const div = document.createElement('div');
        div.className = 'metric-item';
        div.innerHTML = `
            <span class="metric-label">${label}</span>
            <span class="metric-value">${value}</span>
        `;
        metricsGrid.appendChild(div);
    });

    // Diameter recommendation
    const recDiv = document.getElementById('diameter-recommendation');
    const dMin = isImperial ? Math.ceil(r.dMinFCC * 39.37) : Math.ceil(r.dMinFCC * 100);
    const dMax = isImperial ? Math.floor(r.dMax * 39.37) : Math.floor(r.dMax * 100);
    const ideal = isImperial ? Math.max(dMin, Math.min(Math.round(r.dCm / 2.54), dMax)) : Math.max(dMin, Math.min(r.dCm, dMax));
    const sliderDisabled = dMin >= dMax;
    const unitText = isImperial ? 'in' : 'cm';

    recDiv.innerHTML = `
        <div class="diameter-ideal-display">
            <span class="diameter-ideal-number">${ideal}</span>
            <span class="diameter-ideal-unit">${unitText}</span>
        </div>
        <div class="diameter-range-info">${window.I18n.format(window.I18n.t('diameter_range_label'), dMin, dMax)}</div>
        <div class="diameter-range-bar-container">
            <input type="range" class="diameter-slider" min="${dMin}" max="${dMax}" value="${ideal}" step="1"${sliderDisabled ? ' disabled' : ''}>
            <div class="diameter-range-endpoints">
                <span>${dMin} ${unitText}</span>
                <span>${dMax} ${unitText}</span>
            </div>
        </div>
    `;

    if (!sliderDisabled) {
        const slider = recDiv.querySelector('.diameter-slider');
        const numberDisplay = recDiv.querySelector('.diameter-ideal-number');
        const fanDiameterInput = document.getElementById('fan-diameter');

        slider.addEventListener('input', () => {
            numberDisplay.textContent = slider.value;
            fanDiameterInput.value = slider.value;
        });

        slider.addEventListener('change', () => {
            fanDiameterInput.value = slider.value;
            fanDiameterInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }
}

function buildResultExplanation(r) {
    const paragraphs = [];
    const isImperial = window.I18n.unit === 'imperial';

    if (r.isReducedFanCount) {
        paragraphs.push(window.I18n.format(window.I18n.t('explanation_reduced_count'), r.optimalFanCount, r.numFans));
    }

    const roomFF = r.L / r.W;
    const positions = r.fanPositions
        .map((pos, index) => window.I18n.format(window.I18n.t('explanation_fan_position'), index + 1, formatMeters(pos.x), formatMeters(pos.y)))
        .join(window.I18n.t('limit_and') === ' et ' ? ' ; ' : ', ');

    const cellExplanation = r.numFans === 1
        ? window.I18n.format(window.I18n.t('explanation_single_cell'), formatMeters(r.cellL), formatMeters(r.cellW), buildTooltip(window.I18n.t('facteur_de_forme_term'), getFormFactorTooltip()), formatNumber(roomFF))
        : window.I18n.format(window.I18n.t('explanation_multi_cell'), formatMeters(r.L), formatMeters(r.W), r.nx, r.ny, r.numFans, formatMeters(r.cellL), formatMeters(r.cellW), buildTooltip(window.I18n.t('facteur_de_forme_term'), getFormFactorTooltip()), formatNumber(roomFF), formatNumber(r.ffCell));

    const placementExplanation = r.numFans === 1
        ? window.I18n.format(window.I18n.t('explanation_single_placement'), formatMeters(r.fanPositions[0].x), formatMeters(r.fanPositions[0].y), formatMeters(r.distWall))
        : window.I18n.format(window.I18n.t('explanation_multi_placement'), positions, formatMeters(r.distWall), formatMeters(r.interDist));

    const dVal = isImperial ? Math.round(r.dCm / 2.54) : r.dCm;
    const dMinFCCVal = isImperial ? Math.ceil(r.dMinFCC * 39.37) : Math.ceil(r.dMinFCC * 100);
    const dMaxFCCVal = isImperial ? Math.floor(r.dMaxFCC * 39.37) : Math.floor(r.dMaxFCC * 100);
    const dMaxVal = isImperial ? Math.floor(r.dMax * 39.37) : Math.floor(r.dMax * 100);

    const hPalesVal = isImperial ? (r.hPales * 3.28084).toFixed(1) : (r.hPales * 100).toFixed(0);
    const hMontageVal = isImperial ? (r.hMontage * 3.28084).toFixed(1) : (r.hMontage * 100).toFixed(0);
    const securityHeightVal = isImperial ? (r.securityHeight * 3.28084).toFixed(1) : (r.securityHeight * 100).toFixed(0);

    const diameterExplanation = window.I18n.format(window.I18n.t('explanation_diameter'), dVal, dMinFCCVal, dMaxFCCVal, dMaxVal, describeLimitingConstraints(r));

    const marketExplanation = window.I18n.format(window.I18n.t('explanation_market'), dMinFCCVal, dMaxVal, dVal);

    const mountingExplanation = window.I18n.format(window.I18n.t('explanation_mounting'), buildMountingTooltip(r.mountingType), hPalesVal, hMontageVal, securityHeightVal, r.mountingType === 'Standard' ? window.I18n.t('explanation_mounting_standard') : window.I18n.t('explanation_mounting_low_profile'));

    const vAirVal = isImperial ? Math.round(r.vAirEstimate * 196.85) : r.vAirEstimate.toFixed(2);
    const ceVal = isImperial ? (r.ceEstimate * 1.8).toFixed(1) : r.ceEstimate.toFixed(1);

    const performanceExplanation = window.I18n.format(window.I18n.t('explanation_performance'), vAirVal, ceVal, (r.mountingFactor * 100).toFixed(0));

    paragraphs.push(cellExplanation);
    paragraphs.push(placementExplanation);
    paragraphs.push(diameterExplanation);
    paragraphs.push(marketExplanation);
    paragraphs.push(mountingExplanation);
    paragraphs.push(performanceExplanation);

    return paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
}

function buildConstraintChecks(r) {
    const isImperial = window.I18n.unit === 'imperial';
    const hPalesDetail = isImperial 
        ? (r.D < 2.13 ? `≥ 7.0 ft` : `[max(10ft; 0.8D) – 1.2D]`)
        : (r.D < 2.13 ? `≥ 213 cm` : `[max(3m; 0,8D) – 1,2D]`);
    const hMontageMinAllowed = r.hMontageMinAllowed || 0.25 * r.D;

    const constraints = [
        {
            id: 'fcc',
            labelKey: 'constraint_fcc',
            value: r.fcc.toFixed(2),
            status: (r.fcc >= 0.2 && r.fcc <= 0.4) ? 'pass' : 'fail',
            detail: `[0,20 – 0,40]`
        },
        {
            id: 'ff',
            labelKey: 'constraint_ff',
            value: r.ffCell.toFixed(2),
            status: r.ffCell < 1.41 ? 'pass' : (r.isReducedFanCount ? 'warn' : 'fail'),
            detail: `< 1,41 (√2)`
        },
        {
            id: 'wall',
            labelKey: 'constraint_wall',
            value: isImperial 
                ? `${(r.distWall * 3.28084).toFixed(1)} ft > ${(r.D * 3.28084).toFixed(1)} ft`
                : `${(r.distWall * 100).toFixed(0)} cm > ${r.dCm} cm`,
            status: r.wallOk ? 'pass' : 'fail',
            detail: isImperial 
                ? `P = ${(r.distWall * 3.28084).toFixed(1)} ft`
                : `P = ${(r.distWall).toFixed(2)} m`
        },
        {
            id: 'inter',
            labelKey: 'constraint_inter',
            value: r.interDist 
                ? (isImperial 
                    ? `${(r.interDist * 3.28084).toFixed(1)} ft > ${(2.5 * r.D * 3.28084).toFixed(1)} ft`
                    : `${(r.interDist * 100).toFixed(0)} cm > ${(2.5 * r.dCm).toFixed(0)} cm`)
                : window.I18n.t('constraint_na_single'),
            status: r.numFans === 1 ? 'pass' : r.interOk ? 'pass' : 'fail',
            detail: r.interDist 
                ? (isImperial 
                    ? `E = ${(r.interDist * 3.28084).toFixed(1)} ft`
                    : `E = ${r.interDist.toFixed(2)} m`)
                : ''
        },
        {
            id: 'mounting',
            labelKey: 'constraint_mounting',
            value: isImperial 
                ? `${(r.hMontage * 3.28084).toFixed(1)} ft (${window.I18n.t(r.mountingType)})`
                : `${(r.hMontage * 100).toFixed(0)} cm (${window.I18n.t(r.mountingType)})`,
            status: r.hMontage + EPSILON >= hMontageMinAllowed ? 'pass' : 'fail',
            detail: `[0,25D – 0,35D]`
        },
        {
            id: 'blade-height',
            labelKey: 'constraint_blade_height',
            value: isImperial 
                ? `${(r.hPales * 3.28084).toFixed(1)} ft`
                : `${(r.hPales * 100).toFixed(0)} cm`,
            status: r.hPalesOk ? 'pass' : 'fail',
            detail: hPalesDetail
        },
    ];

    if (r.isReducedFanCount) {
        constraints.unshift({
            id: 'fan-count',
            labelKey: 'constraint_reduced_count',
            value: `${r.numFans} / ${r.optimalFanCount} ${window.I18n.t('metric_optimal')}`,
            status: 'warn',
            detail: window.I18n.t('constraint_user_choice')
        });
    }

    return constraints;
}

function getConstraintFailureLabels(r) {
    return buildConstraintChecks(r)
        .filter(item => item.status === 'fail')
        .map(item => {
            switch (item.id) {
                case 'fcc':
                    return window.I18n.t('badge_fcc');
                case 'ff':
                    return window.I18n.t('badge_ff');
                case 'wall':
                    return window.I18n.t('badge_wall');
                case 'inter':
                    return window.I18n.t('badge_inter');
                case 'mounting':
                    return window.I18n.t('badge_mounting');
                case 'blade-height':
                    return window.I18n.t('badge_blade_height');
                default:
                    return window.I18n.t(item.labelKey);
            }
        });
}

function describeLimitingConstraints(r) {
    const constraints = [
        { label: window.I18n.t('limit_surface_size'), value: r.dMaxFCC },
        { label: window.I18n.t('limit_wall_distance'), value: r.dMaxWall },
        { label: window.I18n.t('limit_inter_fan_distance'), value: r.dMaxInter },
        { label: window.I18n.t('limit_available_height'), value: r.dMaxHeight },
    ].filter(item => Number.isFinite(item.value));

    const minValue = Math.min(...constraints.map(item => item.value));
    const active = constraints
        .filter(item => Math.abs(item.value - minValue) < 1e-6)
        .map(item => item.label);

    if (active.length === 1) return active[0];
    return active.join(window.I18n.t('limit_and'));
}

function formatNumber(value) {
    return value.toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1').replace('.', ',');
}

function formatMeters(value) {
    if (window.I18n.unit === 'imperial') {
        return (value * 3.28084).toFixed(1);
    }
    return formatNumber(value);
}

function formatLength(valueMeters, includeUnit = true) {
    if (window.I18n.unit === 'imperial') {
        const feet = valueMeters * 3.28084;
        return feet.toFixed(1) + (includeUnit ? ' ft' : '');
    }
    return valueMeters.toFixed(2) + (includeUnit ? ' m' : '');
}

function formatHeight(valueMeters, includeUnit = true) {
    if (window.I18n.unit === 'imperial') {
        const feet = valueMeters * 3.28084;
        return feet.toFixed(1) + (includeUnit ? ' ft' : '');
    }
    return (valueMeters * 100).toFixed(0) + (includeUnit ? ' cm' : '');
}

function formatDiameter(valueCm, includeUnit = true) {
    if (window.I18n.unit === 'imperial') {
        const inches = valueCm / 2.54;
        return Math.round(inches) + (includeUnit ? ' in' : '');
    }
    return Math.round(valueCm) + (includeUnit ? ' cm' : '');
}

function formatSpeed(valueMps, includeUnit = true) {
    if (window.I18n.unit === 'imperial') {
        const fpm = valueMps * 196.85;
        return Math.round(fpm) + (includeUnit ? ' fpm' : '');
    }
    return valueMps.toFixed(2) + (includeUnit ? ' m/s' : '');
}

function formatTempDiff(valueC, includeUnit = true) {
    if (window.I18n.unit === 'imperial') {
        const f = valueC * 1.8;
        return f.toFixed(1) + (includeUnit ? ' °F' : '');
    }
    return valueC.toFixed(1) + (includeUnit ? ' °C' : '');
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
    const tooltip = getMountingTooltip(mountingType);
    return tooltip ? buildTooltip(window.I18n.t(mountingType), tooltip) : escapeHtml(window.I18n.t(mountingType));
}

// ── Canvas Theme Helper ───────────────────────────

function getCanvasColors() {
    const s = getComputedStyle(document.documentElement);
    const v = (name) => s.getPropertyValue(name).trim();
    return {
        bg: v('--canvas-bg'),
        roomFill: v('--canvas-room-fill'),
        roomStroke: v('--canvas-room-stroke'),
        grid: v('--canvas-grid'),
        fanFill: v('--canvas-fan-fill'),
        fanStroke: v('--canvas-fan-stroke'),
        fanBladeFill: v('--canvas-fan-blade-fill'),
        fanBladeStroke: v('--canvas-fan-blade-stroke'),
        fanDot: v('--canvas-fan-dot'),
        dimColor: v('--canvas-dim-color'),
        wallColor: v('--canvas-wall-color'),
        floor: v('--canvas-floor'),
        rod: v('--canvas-rod'),
        body: v('--canvas-body'),
        bladeOk: v('--canvas-blade-ok'),
        flow: v('--canvas-flow'),
        secLine: v('--canvas-sec-line'),
        secText: v('--canvas-sec-text'),
        secFill: v('--canvas-sec-fill'),
        labelMuted: v('--canvas-label-muted'),
        diagBg: v('--canvas-diag-bg'),
        diagBorder: v('--canvas-diag-border'),
        diagText: v('--canvas-diag-text'),
        accent: v('--accent'),
        red: v('--red'),
        orange: v('--orange'),
    };
}

// ── Canvas Drawing: Plan View ─────────────────────

function drawPlanView(r) {
    const canvas = document.getElementById('canvas-plan');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const C = getCanvasColors();
    const isImperial = window.I18n.unit === 'imperial';

    // Canvas sizing
    const displayW = canvas.parentElement.clientWidth - 24;
    const displayH = Math.min(500, displayW * (r.W / r.L) + 120);
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = C.bg;
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
    ctx.strokeStyle = C.roomStroke;
    ctx.lineWidth = 2;
    ctx.fillStyle = C.roomFill;
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, roomPxW, roomPxH);
    ctx.fill();
    ctx.stroke();

    // ── Draw grid lines ──
    ctx.strokeStyle = C.grid;
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

    // ── Draw fans ──
    r.fanPositions.forEach((pos, idx) => {
        const cx = toCanvasX(pos.x);
        const cy = toCanvasY(pos.y);
        const radius = (r.D / 2) * scale;

        // Influence zone (large circle)
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = C.fanFill;
        ctx.fill();
        ctx.strokeStyle = C.fanStroke;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        if (failedConstraintIds.has('fcc')) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = C.secFill;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 107, 107, 0.65)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Fan blades (stylized)
        drawFanIcon(ctx, cx, cy, radius * 0.6, C);

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = failedConstraintIds.has('fcc') ? C.red : C.fanDot;
        ctx.fill();
    });

    // ── Dimension annotations ──
    ctx.fillStyle = C.dimColor;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Room length (top)
    drawDimension(ctx, offsetX, offsetY - 18, offsetX + roomPxW, offsetY - 18, formatLength(r.L), C.dimColor);

    // Room width (left)
    drawDimensionVertical(ctx, offsetX - 18, offsetY, offsetX - 18, offsetY + roomPxH, formatLength(r.W), C.dimColor);

    // Cell dimensions (if multiple cells)
    if (r.nx > 1 || r.ny > 1) {
        const cellPxW = r.cellL * scale;
        const cellPxH = r.cellW * scale;
        const cellDimColor = C.fanStroke;
        
        // Cell length (bottom of first cell)
        if (r.nx > 1) {
            drawDimension(ctx, offsetX, offsetY + roomPxH + 20, offsetX + cellPxW, offsetY + roomPxH + 20, formatLength(r.cellL), cellDimColor);
        }
        // Cell width (right of first cell)
        if (r.ny > 1) {
            drawDimensionVertical(ctx, offsetX + roomPxW + 20, offsetY, offsetX + roomPxW + 20, offsetY + cellPxH, formatLength(r.cellW), cellDimColor);
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
        const wallColor = failedConstraintIds.has('wall') ? 'rgba(255, 107, 107, 0.9)' : C.wallColor;

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
        const distLabel = isImperial ? `${(nearest.dist * 3.28084).toFixed(1)} ft` : `${(nearest.dist * 100).toFixed(0)} cm`;
        ctx.fillText(`P=${distLabel}`, (cx + nearest.x) / 2 + 5, (cy + nearest.y) / 2);
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
            const interLabel = isImperial ? `${(pair.distance * 3.28084).toFixed(1)} ft` : `${(pair.distance * 100).toFixed(0)} cm`;
            ctx.fillText(`E=${interLabel}`, (x1 + x2) / 2, (y1 + y2) / 2 - 8);
        }
    }

    drawDiagnosticBadges(ctx, issueLabels, offsetX + 8, offsetY + 8);
}

function drawFanIcon(ctx, cx, cy, size, C) {
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
        
        ctx.fillStyle = C.fanBladeFill;
        ctx.fill();
        ctx.strokeStyle = C.fanBladeStroke;
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
    const C = getCanvasColors();

    const displayW = canvas.parentElement.clientWidth - 24;
    const displayH = Math.min(400, displayW * 0.55);
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = C.bg;
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
    ctx.strokeStyle = C.roomStroke;
    ctx.lineWidth = 2;
    ctx.fillStyle = C.roomFill;
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, roomPxW, roomPxH);
    ctx.fill();
    ctx.stroke();

    // Floor
    ctx.fillStyle = C.floor;
    ctx.fillRect(offsetX, offsetY + roomPxH - 4, roomPxW, 4);

    // Ceiling
    ctx.fillStyle = C.floor;
    ctx.fillRect(offsetX, offsetY, roomPxW, 4);

    // ── Fan position in section ──
    const fanCenterX = offsetX + roomPxW / 2;
    const hMontPx = r.hMontage * scale;
    const hPalesPx = r.hPales * scale;
    const fanY = offsetY + hMontPx;
    const fanRadius = (r.D / 2) * scale;
    const mountingColor = failedConstraintIds.has('mounting') ? 'rgba(255, 107, 107, 0.9)' : C.rod;
    const bladeColor = failedConstraintIds.has('blade-height') ? 'rgba(255, 107, 107, 0.85)' : C.bladeOk;
    const diameterColor = failedConstraintIds.has('fcc') ? 'rgba(255, 107, 107, 0.9)' : C.bladeOk;

    // Mounting rod
    ctx.strokeStyle = mountingColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fanCenterX, offsetY + 4);
    ctx.lineTo(fanCenterX, fanY);
    ctx.stroke();

    // Fan body
    ctx.fillStyle = C.body;
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
    ctx.strokeStyle = C.flow;
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
    drawDimensionVertical(ctx, offsetX - 25, offsetY, offsetX - 25, offsetY + roomPxH, `${window.I18n.t('canvas_hsp')} ${formatLength(r.HSP)}`, C.dimColor);

    // H_montage (right side, ceiling to fan)
    if (hMontPx > 15) {
        drawDimensionVertical(ctx, offsetX + roomPxW + 25, offsetY, offsetX + roomPxW + 25, fanY, formatHeight(r.hMontage), failedConstraintIds.has('mounting') ? C.red : C.orange);
    }

    // H_pales (right side, fan to floor)
    drawDimensionVertical(ctx, offsetX + roomPxW + 55, fanY, offsetX + roomPxW + 55, offsetY + roomPxH, formatHeight(r.hPales), failedConstraintIds.has('blade-height') ? C.red : C.accent);

    // Diameter (under fan)
    const dLabelY = fanY + 20;
    drawDimension(ctx, fanCenterX - fanRadius, dLabelY, fanCenterX + fanRadius, dLabelY, `D=${formatDiameter(r.dCm)}`, diameterColor);

    // ── Labels ──
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Mounting type label
    let mountColor = C.accent;
    if (r.mountingType === 'Low-profile') mountColor = C.orange;
    if (r.mountingType !== 'Standard' && r.mountingType !== 'Low-profile') mountColor = C.red;
    ctx.fillStyle = mountColor;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`${window.I18n.t('canvas_mounting_prefix')}${window.I18n.t(r.mountingType)}`, fanCenterX, fanY - 15);

    // Security line
    const secY = offsetY + roomPxH - r.securityHeight * scale;
    ctx.strokeStyle = C.secLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(offsetX, secY);
    ctx.lineTo(offsetX + roomPxW, secY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (failedConstraintIds.has('blade-height')) {
        ctx.fillStyle = C.secFill;
        ctx.fillRect(offsetX, secY, roomPxW, offsetY + roomPxH - secY);
    }

    ctx.fillStyle = C.secText;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${window.I18n.t('canvas_security')}: ${formatHeight(r.securityHeight)}`, offsetX + 5, secY - 4);

    // Floor / Ceiling labels
    ctx.fillStyle = C.labelMuted;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(window.I18n.t('canvas_ceiling'), offsetX + roomPxW / 2, offsetY - 8);
    ctx.fillText(window.I18n.t('canvas_floor'), offsetX + roomPxW / 2, offsetY + roomPxH + 16);

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

    const C = getCanvasColors();
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

        ctx.fillStyle = C.diagBg;
        ctx.strokeStyle = C.diagBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = C.diagText;
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
