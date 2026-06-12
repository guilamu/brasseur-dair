/* =============================================
   BRASSE — i18n Translation Dictionary and Engine
   ============================================= */

window.I18n = {
    lang: 'fr',
    unit: 'metric',
    translations: {
        fr: {
            // General & Header
            "app_title": "Brasseur d'Air",
            "meta_title": "BRASSE — Placement de brasseurs d'air",
            "meta_desc": "Outil de dimensionnement et placement optimal de brasseurs d'air plafonniers selon les règles BRASSE.",
            "header_subtitle": "Outil de dimensionnement & placement optimal, basé sur les publications ADEME du programme BRASSE.",
            "header_btn_why": "📊 Pourquoi le brasseur d'air ?",
            "header_btn_sizing": "📐 Outil Calepinage",
            "theme_toggle_title": "Changer de thème",
            "theme_toggle_label": "Basculer le thème clair / sombre",

            // Input Panel
            "panel_settings": "📐 Paramètres",
            "room_dimensions": "Dimensions de la pièce",
            "label_length": "Longueur",
            "label_width": "Largeur",
            "label_height": "Hauteur sous plafond",
            "room_usage": "Usage de la pièce",
            "label_activity": "Type d'activité",
            "usage_chambre": "🛏️ Chambre / Repos",
            "usage_sejour": "🛋️ Séjour / Activités douces",
            "usage_bureau": "💼 Bureau / Tertiaire",
            "usage_scolaire": "🏫 Scolaire / Enseignement",
            "usage_sport": "🏃 Sport / Activités soutenues",
            "fan_count_group": "Nombre de brasseurs",
            "fan_count_label": "Brasseurs à installer",
            "fan_count_hint_auto": "Le nombre optimal est calculé automatiquement selon les dimensions de la pièce.",
            "fan_count_recommended": "{0} (recommandé)",
            "fan_count_hint_optimal": "Configuration optimale : {0} brasseur(s) de {1} cm.",
            "fan_count_hint_reduced": "Avec {0} brasseur(s), le diamètre conseillé passe à {1} cm.{2}",
            "fan_count_warning_ff": " Attention : cellules allongées (FF = {0}), la diffusion sera moins régulière.",
            "fan_diameter_group": "Brasseur d'air <span class=\"optional-tag\">optionnel</span>",
            "fan_diameter_label": "Diamètre du brasseur",
            "fan_diameter_hint": "Laissez vide pour un calcul automatique",
            "v_target_label": "Vitesse d'air cible",
            "dba_target_label": "Bruit max acceptable",
            "met_label": "Métabolisme",

            // Results Panel
            "panel_results": "📊 Résultats",
            "results_placeholder": "Renseignez les dimensions de votre pièce pour voir le placement optimal se mettre à jour automatiquement.",
            "card_fans": "Brasseur(s)",
            "card_diameter": "Diamètre (cm)",
            "card_mounting": "Montage",
            "card_ce": "Effet rafraîchissant (°C)",
            "constraints_title": "Vérification des contraintes",
            "explanation_title": "Explication du choix",
            "view_plan": "Vue en plan",
            "view_section": "Vue en coupe",
            "metrics_title": "Métriques détaillées",
            "diameter_rec_title": "Diamètre recommandé",
            "market_note": "Afin d'optimiser l'acoustique et la pérennité de votre brasseur, privilégiez un modèle avec fixation sur rotule/pivot.",

            // Footer
            "footer_intro": "Cette application indépendante s'appuie sur les publications ADEME du programme BRASSE.",
            "footer_sources_brasse1": "BRASSE, Brasseurs d'air, une solution de sobriété et d'efficacité",
            "footer_sources_brasse1_credits": "Crédits : Envirobat BDM, Surya Consultants, ISEA Projects, ADEME.",
            "footer_sources_brasse2": "BRASSE II : Base de données des performances de 50 brasseurs d'air plafonniers à pales",
            "footer_sources_brasse2_credits": "Crédits : Surya Consultants, LASA.",
            "footer_rules_interpretation": "Les règles de calepinage, indicateurs de performance et données marché affichés ici sont une interprétation de ces travaux publics.",
            "footer_code_source": "Code source",
            "footer_version": "Version 0.9.3",
            "footer_disclaimer": "Cet outil est fourni à titre indicatif. Consultez un professionnel pour toute installation.",

            // Dynamic strings, Errors, Tooltips
            "form_factor_tooltip": "Rapport entre la plus grande et la plus petite dimension d'une zone. Plus il est proche de 1, plus la zone est proche d'un carré et plus la diffusion de l'air a des chances d'être régulière.",
            "mounting_tooltip_standard": "Montage de référence avec une retombée d'environ 0,35 fois le diamètre. C'est le cas le plus favorable pour la performance.",
            "mounting_tooltip_low_profile": "Montage plus proche du plafond, utilisé quand la hauteur manque pour un standard. Le brassage reste bon, mais la performance est un peu moins favorable.",
            "mounting_tooltip_flush": "Montage très plaqué au plafond. Cette configuration est généralement moins performante et doit être évitée si une autre solution est possible.",
            
            "error_no_manual_diameter": "Aucun diamètre manuel à diagnostiquer.",
            "error_no_config_found": "Aucune configuration viable trouvée. Vérifiez les dimensions (plafond trop bas ou pièce trop petite).",
            "error_no_diagnostic_possible": "Aucune implantation de diagnostic n'a pu être générée pour ce diamètre manuel.",

            // Constraints labels & values
            "constraint_fcc": "FCC (facteur de couverture)",
            "constraint_ff": "FF (facteur de forme cellule)",
            "constraint_wall": "Distance aux murs (P > D)",
            "constraint_inter": "Distance inter-brasseurs (E > 2,5D)",
            "constraint_mounting": "Distance de montage",
            "constraint_blade_height": "Hauteur des pales",
            "constraint_reduced_count": "Nombre de brasseurs réduit",
            "constraint_user_choice": "choix utilisateur",
            "constraint_na_single": "N/A (1 seul)",

            // Constraint Failures Badges
            "badge_fcc": "Diamètre hors plage pour la surface traitée",
            "badge_ff": "Cellule trop allongée",
            "badge_wall": "Distance au mur insuffisante",
            "badge_inter": "Entraxe insuffisant",
            "badge_mounting": "Distance de montage trop faible",
            "badge_blade_height": "Hauteur des pales insuffisante",

            // Canvas Labels
            "canvas_ceiling": "Plafond",
            "canvas_floor": "Sol",
            "canvas_security": "Sécurité",
            "canvas_hsp": "HSP",
            "canvas_mounting_prefix": "Montage ",

            // Limits descriptions
            "limit_surface_size": "la taille de la surface à ventiler",
            "limit_wall_distance": "la distance aux murs",
            "limit_inter_fan_distance": "la distance entre brasseurs",
            "limit_available_height": "la hauteur disponible",
            "limit_and": " et ",

            // Detailed metrics table rows
            "metric_room_area": "Surface pièce",
            "metric_cell_count": "Nb cellules",
            "metric_cell_dim": "Dim. cellule",
            "metric_cell_area": "Surface cellule",
            "metric_d_ideal": "D idéal",
            "metric_d_range": "Plage D acceptable",
            "metric_d_min": "D min (FCC=0.2)",
            "metric_d_max_fcc": "D max (FCC=0.4)",
            "metric_d_max_global": "D max global",
            "metric_h_mounting": "H montage",
            "metric_h_blades": "H pales (sol)",
            "metric_v_air": "V air estimée",
            "metric_mounting_perf": "Perf. montage",
            "metric_user_choice": "Choix utilisateur",
            "metric_optimal": "optimal",

            // Explanations text parts
            "explanation_reduced_count": "Vous avez choisi de réduire le nombre de brasseurs de {0} (optimal) à {1}. Ce choix augmente la taille des cellules de couverture et nécessite un diamètre plus important par brasseur.",
            "explanation_single_cell": "La pièce est traitée comme une seule cellule de {0} m x {1} m. Le {2} de la pièce est {3}, ce qui reste compatible avec une implantation symétrique sans découpage supplémentaire.",
            "explanation_multi_cell": "La pièce de {0} m x {1} m est découpée en {2} x {3} cellules, soit {4} zones identiques de {5} m x {6} m. Ce découpage ramène le {7} de {8} à {9} par cellule, ce qui rapproche l'implantation d'une configuration plus régulière.",
            "explanation_single_placement": "Le brasseur est placé au centre de la pièce, à la position ({0} m ; {1} m). Cette position centrée maximise la symétrie de diffusion et laisse {2} m jusqu'au mur le plus proche.",
            "explanation_multi_placement": "Chaque brasseur est placé au centre de sa cellule pour respecter la règle de symétrie. En lisant le plan de gauche à droite, cela donne : {0}. La distance au mur la plus faible vaut {1} m et l'entraxe minimal entre deux brasseurs vaut {2} m.",
            "explanation_diameter": "Le diamètre calculé retenu par l'application est de {0} cm. Pour cette surface à ventiler, un diamètre cohérent se situe ici entre {1} cm et {2} cm. Le diamètre maximal global est de {3} cm, limité principalement par {4}.",
            "explanation_market": "Tout diamètre compris entre {0} cm et {1} cm convient. L'application retient le diamètre le plus grand possible ({2} cm) pour maximiser le confort.",
            "explanation_mounting": "Le montage retenu est {0}. Le plan de rotation des pâles est positionné à {1} cm du sol et à {2} cm sous le plafond. Cette implantation respecte la hauteur minimale de sécurité de {3} cm et {4}.",
            "explanation_mounting_standard": "conserve la distance de montage optimale de référence",
            "explanation_mounting_low_profile": "abaisse les pâles au plus bas autorisé pour préserver au mieux la performance",
            "explanation_performance": "Avec cette configuration, l'application estime une vitesse d'air moyenne d'environ {0} m/s pour un effet rafraîchissant proche de {1} °C. Le niveau de performance de montage retenu est de {2}%.",

            // ==================== GIVONI PAGE ====================
            "givoni_title": "Comprendre le brasseur d'air : Le Diagramme de Givoni",
            "givoni_desc": "Découvrez le diagramme bioclimatique de Givoni interactif. Comprenez comment le brasseur d'air plafonnier améliore le confort thermique de façon sobre et durable en été comme en hiver.",
            "givoni_hero_title": "Pourquoi brasser de l'air chaud apporte-t-il du confort ?",
            "givoni_hero_desc": "Contrairement à la climatisation qui refroidit la température globale d'une pièce à grand renfort d'énergie, le brasseur d'air plafonnier agit directement sur le corps humain. Le <strong>Diagramme de Givoni</strong> démontre scientifiquement ce principe : en augmentant la vitesse de l'air, nous repoussons de plusieurs degrés la zone de confort thermique naturelle, pour une consommation électrique infime.",
            
            "givoni_sim_title": "Simulateur Bioclimatique de Givoni",
            "givoni_sim_helper": "Cliquez/glissez sur le graphique ou utilisez les curseurs",
            "givoni_x_axis": "Température Sèche de l'Air (°C)",
            "givoni_y_axis_specific": "Humidité Spécifique (g d'eau / kg d'air sec)",
            "givoni_y_axis_absolute": "Humidité Absolue (g/kg)",
            
            "slider_temp_title": "🌡️ Température Ambiante",
            "slider_hum_title": "💧 Humidité Relative",
            
            "diag_status_loading": "Analyse en cours...",
            "diag_title_base": "Confort Thermique de Base",
            "diag_desc_base": "Déterminez le confort en modifiant la température et l'humidité.",
            "diag_action_base": "Recommandation passive.",
            
            "fan_sim_state_stopped": "Brasseur d'air arrêté",
            "fan_sim_effect_none": "Aucun effet de rafraîchissement nécessaire",
            
            "explain_title": "L'utilité du Brasseur d'Air expliquée",
            
            // Tabs titles
            "tab_physio": "Physiologie",
            "tab_energy": "Énergie & Coûts",
            "tab_couplage": "Couplage Clim",
            "tab_saisons": "Saisons",
            
            // Tab 1: Physiologie contents
            "physio_title1": "Le ventilateur ne refroidit pas la pièce, il refroidit la peau",
            "physio_desc1": "C'est l'un des malentendus les plus courants : un brasseur d'air n'abaisse pas la température physique (mesurée par un thermomètre classique). En revanche, il modifie la <strong>température ressentie</strong> en agissant sur les mécanismes de régulation thermique du corps humain.",
            
            "physio_title2": "Deux effets physiques majeurs",
            "physio_desc2": "<strong>1. L'accélération de l'évaporation (Effet principal) :</strong> Notre peau évapore continuellement une infime pellicule d'eau (la transpiration). Le flux d'air accélère cette évaporation. Ce changement d'état liquide-gaz est endothermique : il absorbe directement la chaleur de notre épiderme, créant une baisse immédiate de température cutanée.<br><br><strong>2. La convection forcée :</strong> Notre corps chauffe naturellement l'air qui l'entoure immédiatement, créant une enveloppe d'air chaud et isolante (la couche limite). Le brasseur d'air balaie cette enveloppe chaude pour la remplacer par l'air ambiant de la pièce (s'il est plus frais que la température corporelle, soit < 37°C), facilitant la dissipation thermique de notre corps.",
            
            "physio_title3": "La règle d'or scientifique (1 m/s = -3°C)",
            "physio_desc3": "Les études issues des travaux bioclimatiques de Givoni et les normes de confort (ASHRAE 55) s'accordent sur un fait majeur : une vitesse d'air moyenne de <strong>1 m/s</strong> au niveau des occupants équivaut à un rafraîchissement ressenti de <strong>2°C à 4°C</strong> de moins. Ainsi, à 30°C dans un espace brassé, votre corps se comporte exactement comme s'il faisait 26°C ou 27°C dans une pièce sans courant d'air.",

            // Tab 2: Énergie & Coûts contents
            "energy_title1": "L'incroyable efficacité énergétique du mouvement",
            "energy_desc1": "Sur le plan thermodynamique, modifier la température globale de milliers de mètres cubes d'air demande une quantité faramineuse d'énergie (utilisation d'un compresseur et cycle de réfrigération). Mettre en mouvement ce même volume pour refroidir uniquement les corps est infiniment plus sobre.",
            "energy_stat_ratio_num": "15x à 40x",
            "energy_stat_ratio_label": "Moins d'énergie qu'une clim",
            "energy_stat_power_num": "15 à 35 W",
            "energy_stat_power_label": "Puissance type d'un BAP",
            
            "energy_title2": "Comparatif direct de consommation (Données ADEME)",
            "energy_table_th_criterion": "Critère",
            "energy_table_th_ac": "Climatiseur (Chambre 12m²)",
            "energy_table_th_fan": "Brasseur d'Air Plafonnier",
            "energy_table_td_power_name": "Puissance électrique",
            "energy_table_td_power_ac": "1 000 W à 2 000 W",
            "energy_table_td_power_fan": "<strong>15 W à 35 W</strong> (Moteur DC)",
            "energy_table_td_consumption_name": "Consommation typique",
            "energy_table_td_consumption_ac": "500 kWh / an",
            "energy_table_td_consumption_fan": "<strong>15 à 36 kWh / an</strong> (7% de la clim !)",
            "energy_table_td_cost_name": "Coût de fonctionnement",
            "energy_table_td_cost_ac": "~120 € à 150 € / an",
            "energy_table_td_cost_fan": "<strong>~3 € à 8 € / an</strong>",
            "energy_table_td_carbon_name": "Impact carbone",
            "energy_table_td_carbon_ac": "Élevé (fluides frigorigènes + élec)",
            "energy_table_td_carbon_fan": "<strong>Négligeable</strong> (pas de fluides)",

            // Tab 3: Couplage Clim contents
            "couplage_title1": "Climatisation + Brasseur : L'alliance thermodynamique gagnante",
            "couplage_desc1": "Dans les zones tropicales humides ou pendant les canicules extrêmes, la ventilation seule peut ne pas suffire pour atteindre la zone de confort. La solution idéale n'est pas d'allumer la clim à fond, mais d'adopter un <strong>fonctionnement couplé</strong>.",
            "couplage_title2": "Remonter la consigne pour diviser les factures",
            "couplage_desc2": "En faisant fonctionner simultanément un brasseur d'air plafonnier, la sensation de fraîcheur de 2°C à 3°C vous permet de régler le thermostat de votre climatisation à <strong>27°C au lieu de 25°C</strong> (ou 28°C au lieu de 26°C).<br><br>En physique des bâtiments, <strong>chaque degré supplémentaire sur la consigne de climatisation réduit la consommation d'énergie de 7% à 10%</strong>.",
            "couplage_title3": "Résultats des Simulations Dynamiques (ADEME - BRASSE)",
            "couplage_subtitle3": "Études sur Pointe-à-Pitre (Guadeloupe)",
            "couplage_desc3": "Des simulations thermiques dynamiques (STD) réalisées dans le cadre du programme public BRASSE ont prouvé l'efficacité de ce couplage :",
            "couplage_li1": "<strong>Cas N°1 (Chambre) :</strong> Le couplage (clim réglée à 27°C + BAP) réduit la facture annuelle de climatisation de <strong>27%</strong> par rapport à une clim seule réglée à 25°C. La consommation du brasseur ne pèse que 7% du total.",
            "couplage_li2": "<strong>Cas N°2 (Bureau tertiaire) :</strong> La consigne relevée à 27°C with the fan generates <strong>20% energy savings</strong> over the year. The ceiling fan represents only 4% of office consumption.", // corrected later if needed, but let's make it French

            // Tab 4: Saisons contents
            "saisons_title1": "Le mode été : Confort direct par flux vertical",
            "saisons_desc1": "En été (ou en climat tropical permanent), le ventilateur tourne dans le sens horaire direct pour propulser l'air du haut vers le bas. Ce flux d'air vertical vient directement balayer la peau des occupants présents dans le cône de soufflage, maximisant le rafraîchissement par évaporation de la sueur.",
            "saisons_title2": "Le mode hiver : La déstratification thermique",
            "saisons_desc2": "C'est une loi physique incontournable : l'air chaud (plus léger) monte par convection naturelle et s'accumule sous le plafond. Dans une pièce haute de plafond, l'écart de température peut atteindre 5°C à 10°C entre le sol et le plafond (gaspillage d'énergie massif !).<br><br>En hiver, le brasseur d'air est utilisé pour la <strong>déstratification</strong> :",
            "saisons_li1": "Il tourne généralement en <strong>mode inverse (anti-horaire)</strong> à basse vitesse pour propulser l'air doux vers le plafond.",
            "saisons_li2": "L'air s'étale sur le plafond et redescend doucement le long des murs sans générer de courant d'air direct froid sur les personnes.",
            "saisons_li3": "Cela homogénéise la chaleur dans toute la pièce, augmentant le confort au niveau du sol et réduisant les besoins de chauffage de l'ordre de <strong>5% à 10%</strong>.",

            // Givoni zones dictionary
            "zone_comfort_name": "Zone de Confort Naturel",
            "zone_comfort_statusText": "Confort optimal",
            "zone_comfort_desc": "Température et humidité idéales. Le métabolisme régule la chaleur corporelle sans assistance active. Profitez de ce confort passif.",
            "zone_comfort_action": "✅ Conditions parfaites. Aucun traitement thermique requis.",
            "zone_comfort_fanLabel": "Brasseur d'air arrêté",
            "zone_comfort_fanDesc": "Aucune ventilation nécessaire pour le confort thermique.",

            "zone_ventilation_name": "Zone de Confort Brasseur d'Air",
            "zone_ventilation_statusText": "Ventilation efficace",
            "zone_ventilation_desc": "La sensation de chaleur est lourde ou étouffante. La mise en mouvement de l'air à 1 m/s crée une sensation de fraîcheur immédiate de 2°C à 4°C, évacuant la sueur et ramenant le ressenti dans la zone de confort.",
            "zone_ventilation_action": "🌀 Brasseur d'air activé. Évite 100% de climatisation active.",
            "zone_ventilation_fanLabel": "Brasseur d'air activé (Vitesse 2-4)",
            "zone_ventilation_fanDesc": "Génère un flux d'air rafraîchissant de 0,6 à 1,0 m/s sur la peau.",

            "zone_inertia_name": "Inertie & Ventilation Nocturne",
            "zone_inertia_statusText": "Inertie recommandée",
            "zone_inertia_desc": "Climat chaud mais très sec. La chaleur diurne peut être absorbée par l'inertie de la structure du bâtiment. Une ventilation intensive la nuit refroidit les murs qui restituent la fraîcheur en journée.",
            "zone_inertia_action": "🏢 Fermez les fenêtres le jour, ventilez fortement la nuit.",
            "zone_inertia_fanLabel": "Brasseur d'air lent (Vitesse 1-2)",
            "zone_inertia_fanDesc": "Aide à brasser l'air sec et homogénéiser la température.",

            "zone_evaporative_name": "Rafraîchissement Évaporatif",
            "zone_evaporative_statusText": "Refroidissement adiabatique",
            "zone_evaporative_desc": "Climat extrêmement chaud et très sec. Ajouter de l'humidité à l'air (par brumisation ou refroidisseur évaporatif) absorbe les calories par transition de phase de l'eau, faisant chuter la température de l'air de plusieurs degrés.",
            "zone_evaporative_action": "💦 Solution optimale : Brumisation ou rafraîchisseur adiabatique.",
            "zone_evaporative_fanLabel": "Brasseur d'air en soutien",
            "zone_evaporative_fanDesc": "Aide à diffuser l'air refroidi par évaporation.",

            "zone_heating_name": "Chauffage requis (ou Déstratification)",
            "zone_heating_statusText": "Climat froid",
            "zone_heating_desc": "Températures trop basses pour le corps habillé léger. Si vous chauffez la pièce, l'air chaud montera stagner au plafond. Utilisez le brasseur d'air à très basse vitesse ou en rotation inversée pour faire redescendre cette chaleur (déstratification).",
            "zone_heating_action": "🔥 Allumez le chauffage + Brasseur d'air en mode déstratification (sens inverse).",
            "zone_heating_fanLabel": "Mode Déstratification Hiver activé",
            "zone_heating_fanDesc": "Fait redescendre l'air chaud accumulé au plafond sans courant d'air froid.",

            "zone_climatisation_name": "Climatisation nécessaire (Couplage optimal BAP)",
            "zone_climatisation_statusText": "Rafraîchissement requis",
            "zone_climatisation_desc": "Le climat dépasse les limites physiologiques de la simple ventilation (chaleur lourde extrême ou humidité saturée empêchant l'évaporation de la sueur). Une climatisation active est requise pour déshumidifier et refroidir l'espace.",
            "zone_climatisation_action": "❄️ Climatisation active. Réglez la consigne à 27°C et activez le brasseur d'air !",
            "zone_climatisation_fanLabel": "Couplage Clim + BAP (Économies -25%)",
            "zone_climatisation_fanDesc": "Permet de relever le thermostat de clim de 2°C pour un confort identique.",

            "chart_tooltip_format": "{0}°C, {1}% HR ({2} g/kg)",
            
            "diameter_range_label": "Plage acceptable : {0} – {1} cm",
            "explanation_fan_position": "brasseur {0} à {1} m du mur gauche et {2} m du mur haut",
            "facteur_de_forme_term": "facteur de forme",
            "Standard": "Standard",
            "Low-profile": "Low-profile",
            "Flush": "Flush",
            "Non conforme": "Non conforme",

            "unit_toggle_title": "Changer de système d'unités",
            "unit_toggle_label": "Basculer entre le système métrique et impérial",
            "unit_metric": "Métrique",
            "unit_imperial": "Impérial",

            "givoni_x_axis_imp": "Température Sèche de l'Air (°F)",
            "givoni_y_axis_specific_imp": "Humidité Spécifique (grains d'eau / lb d'air sec)",
            "givoni_y_axis_absolute_imp": "Humidité Absolue (grains/lb)",
            "chart_tooltip_format_imp": "{0}°F, {1}% HR ({2} grains/lb)",

            "card_diameter_imp": "Diamètre (in)",
            "card_ce_imp": "Effet rafraîchissant (°F)",

            "metric_room_area_imp": "Surface pièce (sq ft)",
            "metric_cell_dim_imp": "Dim. cellule (ft)",
            "metric_cell_area_imp": "Surface cellule (sq ft)",
            "metric_d_ideal_imp": "D idéal (in)",
            "metric_d_range_imp": "Plage D acceptable (in)",
            "metric_d_min_imp": "D min (FCC=0.2)",
            "metric_d_max_fcc_imp": "D max (FCC=0.4)",
            "metric_d_max_global_imp": "D max global",
            "metric_h_mounting_imp": "H montage (ft)",
            "metric_h_blades_imp": "H pales (sol) (ft)",
            "metric_v_air_imp": "V air estimée (fpm)",

            "diameter_range_label_imp": "Plage acceptable : {0} – {1} in",
            "explanation_fan_position_imp": "brasseur {0} à {1} ft du mur gauche et {2} ft du mur haut",

            "explanation_single_cell_imp": "La pièce est traitée comme une seule cellule de {0} ft x {1} ft. Le {2} de la pièce est {3}, ce qui reste compatible avec une implantation symétrique sans découpage supplémentaire.",
            "explanation_multi_cell_imp": "La pièce de {0} ft x {1} ft est découpée en {2} x {3} cellules, soit {4} zones identiques de {5} ft x {6} ft. Ce découpage ramène le {7} de {8} à {9} par cellule, ce qui rapproche l'implantation d'une configuration plus régulière.",
            "explanation_single_placement_imp": "Le brasseur est placé au centre de la pièce, à la position ({0} ft ; {1} ft). Cette position centrée maximise la symétrie de diffusion et laisse {2} ft jusqu'au mur le plus proche.",
            "explanation_multi_placement_imp": "Chaque brasseur est placé au centre de sa cellule pour respecter la règle de symétrie. En lisant le plan de gauche à droite, cela donne : {0}. La distance au mur la plus faible vaut {1} ft et l'entraxe minimal entre deux brasseurs vaut {2} ft.",
            "explanation_diameter_imp": "Le diamètre calculé retenu par l'application est de {0} in. Pour cette surface à ventiler, un diamètre cohérent se situe ici entre {1} in et {2} in. Le diamètre maximal global est de {3} in, limité principalement par {4}.",
            "explanation_market_imp": "Tout diamètre compris entre {0} in et {1} in convient. L'application retient le diamètre le plus grand possible ({2} in) pour maximiser le confort.",
            "explanation_mounting_imp": "Le montage retenu est {0}. Le plan de rotation des pâles est positionné à {1} ft du sol et à {2} ft sous le plafond. Cette implantation respecte la hauteur minimale de sécurité de {3} ft et {4}.",
            "explanation_performance_imp": "Avec cette configuration, l'application estime une vitesse d'air moyenne d'environ {0} fpm pour un effet rafraîchissant proche de {1} °F. Le niveau de performance de montage retenu est de {2}%."
        },
        en: {
            // General & Header
            "app_title": "Ceiling Fan",
            "meta_title": "BRASSE — Ceiling Fan Placement",
            "meta_desc": "Tool for sizing and optimal placement of ceiling fans according to BRASSE guidelines.",
            "header_subtitle": "Sizing & optimal placement tool, based on ADEME publications from the BRASSE program.",
            "header_btn_why": "📊 Why a ceiling fan?",
            "header_btn_sizing": "📐 Sizing Tool",
            "theme_toggle_title": "Change theme",
            "theme_toggle_label": "Toggle light / dark theme",

            // Input Panel
            "panel_settings": "📐 Settings",
            "room_dimensions": "Room Dimensions",
            "label_length": "Length",
            "label_width": "Width",
            "label_height": "Ceiling height",
            "room_usage": "Room Usage",
            "label_activity": "Activity Type",
            "usage_chambre": "🛏️ Bedroom / Rest",
            "usage_sejour": "🛋️ Living Room / Light Activities",
            "usage_bureau": "💼 Office / Tertiary",
            "usage_scolaire": "🏫 School / Education",
            "usage_sport": "🏃 Sports / Intense Activities",
            "fan_count_group": "Number of Fans",
            "fan_count_label": "Fans to install",
            "fan_count_hint_auto": "The optimal number of fans is automatically calculated based on the room dimensions.",
            "fan_count_recommended": "{0} (recommended)",
            "fan_count_hint_optimal": "Optimal configuration: {0} fan(s) of {1} cm.",
            "fan_count_hint_reduced": "With {0} fan(s), the recommended diameter is {1} cm.{2}",
            "fan_count_warning_ff": " Warning: elongated cells (FF = {0}), air distribution will be less uniform.",
            "fan_diameter_group": "Ceiling Fan <span class=\"optional-tag\">optional</span>",
            "fan_diameter_label": "Fan diameter",
            "fan_diameter_hint": "Leave empty for automatic calculation",
            "v_target_label": "Target air speed",
            "dba_target_label": "Max acceptable noise",
            "met_label": "Metabolism",

            // Results Panel
            "panel_results": "📊 Results",
            "results_placeholder": "Enter the dimensions of your room to see the optimal placement update automatically.",
            "card_fans": "Fan(s)",
            "card_diameter": "Diameter (cm)",
            "card_mounting": "Mounting",
            "card_ce": "Cooling Effect (°C)",
            "constraints_title": "Constraints Check",
            "explanation_title": "Sizing Explanation",
            "view_plan": "Plan View",
            "view_section": "Section View",
            "metrics_title": "Detailed Metrics",
            "diameter_rec_title": "Recommended Diameter",
            "market_note": "To optimize acoustics and the durability of your fan, prefer a model with a ball joint/pivot mounting.",

            // Footer
            "footer_intro": "This independent application is based on ADEME publications from the BRASSE program.",
            "footer_sources_brasse1": "BRASSE, Ceiling fans, a solution for sobriety and efficiency",
            "footer_sources_brasse1_credits": "Credits: Envirobat BDM, Surya Consultants, ISEA Projects, ADEME.",
            "footer_sources_brasse2": "BRASSE II: Database of performances for 50 bladed ceiling fans",
            "footer_sources_brasse2_credits": "Credits: Surya Consultants, LASA.",
            "footer_rules_interpretation": "Sizing rules, performance indicators and market data displayed here are an interpretation of these public works.",
            "footer_code_source": "Source Code",
            "footer_version": "Version 0.9.3",
            "footer_disclaimer": "This tool is provided for information purposes only. Consult a professional for any installation.",

            // Dynamic strings, Errors, Tooltips
            "form_factor_tooltip": "Ratio between the largest and smallest dimensions of a zone. The closer it is to 1, the closer the zone is to a square and the more likely the air distribution is to be regular.",
            "mounting_tooltip_standard": "Reference mounting with a drop of about 0.35 times the diameter. This is the most favorable case for performance.",
            "mounting_tooltip_low_profile": "Mounting closer to the ceiling, used when height is lacking for a standard setup. Mixing remains good, but performance is slightly less favorable.",
            "mounting_tooltip_flush": "Mounting very close to the ceiling. This configuration is generally less efficient and should be avoided if another solution is possible.",
            
            "error_no_manual_diameter": "No manual diameter to diagnose.",
            "error_no_config_found": "No viable configuration found. Check the dimensions (ceiling too low or room too small).",
            "error_no_diagnostic_possible": "No diagnostic layout could be generated for this manual diameter.",

            // Constraints labels & values
            "constraint_fcc": "FCC (coverage factor)",
            "constraint_ff": "FF (cell form factor)",
            "constraint_wall": "Distance to walls (P > D)",
            "constraint_inter": "Inter-fan distance (E > 2.5D)",
            "constraint_mounting": "Mounting distance",
            "constraint_blade_height": "Blade height",
            "constraint_reduced_count": "Reduced number of fans",
            "constraint_user_choice": "user choice",
            "constraint_na_single": "N/A (single fan)",

            // Constraint Failures Badges
            "badge_fcc": "Diameter out of range for the area",
            "badge_ff": "Cell is too elongated",
            "badge_wall": "Insufficient distance to wall",
            "badge_inter": "Insufficient spacing between fans",
            "badge_mounting": "Mounting distance too small",
            "badge_blade_height": "Insufficient blade height",

            // Canvas Labels
            "canvas_ceiling": "Ceiling",
            "canvas_floor": "Floor",
            "canvas_security": "Safety",
            "canvas_hsp": "HSP",
            "canvas_mounting_prefix": "Mounting ",

            // Limits descriptions
            "limit_surface_size": "the size of the area to ventilate",
            "limit_wall_distance": "the distance to the walls",
            "limit_inter_fan_distance": "the distance between fans",
            "limit_available_height": "the available height",
            "limit_and": " and ",

            // Detailed metrics table rows
            "metric_room_area": "Room area",
            "metric_cell_count": "No. of cells",
            "metric_cell_dim": "Cell dim.",
            "metric_cell_area": "Cell area",
            "metric_d_ideal": "Ideal D",
            "metric_d_range": "Acceptable D range",
            "metric_d_min": "Min D (FCC=0.2)",
            "metric_d_max_fcc": "Max D (FCC=0.4)",
            "metric_d_max_global": "Overall max D",
            "metric_h_mounting": "Mounting H",
            "metric_h_blades": "Blade H (floor)",
            "metric_v_air": "Est. air speed",
            "metric_mounting_perf": "Mounting perf.",
            "metric_user_choice": "User choice",
            "metric_optimal": "optimal",

            // Explanations text parts
            "explanation_reduced_count": "You chose to reduce the number of fans from {0} (optimal) to {1}. This choice increases the size of the coverage cells and requires a larger diameter per fan.",
            "explanation_single_cell": "The room is treated as a single cell of {0} m x {1} m. The room's {2} is {3}, which remains compatible with a symmetrical layout without additional cutting.",
            "explanation_multi_cell": "The room of {0} m x {1} m is divided into {2} x {3} cells, creating {4} identical zones of {5} m x {6} m. This division reduces the {7} from {8} to {9} per cell, bringing the layout closer to a more regular configuration.",
            "explanation_single_placement": "The fan is placed in the center of the room, at position ({0} m; {1} m). This centered position maximizes diffusion symmetry and leaves {2} m to the nearest wall.",
            "explanation_multi_placement": "Each fan is placed in the center of its cell to respect the symmetry rule. Reading the plan from left to right, this gives: {0}. The shortest distance to the wall is {1} m and the minimum center-to-center distance between two fans is {2} m.",
            "explanation_diameter": "The calculated diameter chosen by the application is {0} cm. For this surface to ventilate, a consistent diameter here is between {1} cm and {2} cm. The overall maximum diameter is {3} cm, limited mainly by {4}.",
            "explanation_market": "Any diameter between {0} cm and {1} cm is suitable. The application selects the largest possible diameter ({2} cm) to maximize comfort.",
            "explanation_mounting": "The selected mounting is {0}. The blade rotation plane is positioned {1} cm from the floor and {2} cm below the ceiling. This layout respects the minimum safety height of {3} cm and {4}.",
            "explanation_mounting_standard": "maintains the reference optimal mounting distance",
            "explanation_mounting_low_profile": "lowers the blades to the lowest allowed height to best preserve performance",
            "explanation_performance": "With this configuration, the application estimates an average air speed of about {0} m/s for a cooling effect close to {1} °C. The selected mounting performance level is {2}%.",

            // ==================== GIVONI PAGE ====================
            "givoni_title": "Understanding the Ceiling Fan: The Givoni Diagram",
            "givoni_desc": "Discover the interactive Givoni bioclimatic diagram. Understand how a ceiling fan improves thermal comfort in a sober and sustainable way in both summer and winter.",
            "givoni_hero_title": "Why does moving warm air bring comfort?",
            "givoni_hero_desc": "Unlike air conditioning which cools the overall temperature of a room at high energy costs, a ceiling fan acts directly on the human body. The <strong>Givoni Diagram</strong> scientifically demonstrates this principle: by increasing the air speed, we extend the natural thermal comfort zone by several degrees, for a tiny electrical consumption.",
            
            "givoni_sim_title": "Givoni Bioclimatic Simulator",
            "givoni_sim_helper": "Click/drag on the chart or use the sliders",
            "givoni_x_axis": "Dry Bulb Air Temperature (°C)",
            "givoni_y_axis_specific": "Specific Humidity (g water / kg dry air)",
            "givoni_y_axis_absolute": "Absolute Humidity (g/kg)",
            
            "slider_temp_title": "🌡️ Ambient Temperature",
            "slider_hum_title": "💧 Relative Humidity",
            
            "diag_status_loading": "Analysis in progress...",
            "diag_title_base": "Basic Thermal Comfort",
            "diag_desc_base": "Determine comfort by changing temperature and humidity.",
            "diag_action_base": "Passive recommendation.",
            
            "fan_sim_state_stopped": "Ceiling fan stopped",
            "fan_sim_effect_none": "No cooling effect needed",
            
            "explain_title": "Sensing the Breeze: How Ceiling Fans Work",
            
            // Tabs titles
            "tab_physio": "Physiology",
            "tab_energy": "Energy & Costs",
            "tab_couplage": "AC Coupling",
            "tab_saisons": "Seasons",
            
            // Tab 1: Physiology contents
            "physio_title1": "Fans do not cool the room, they cool your skin",
            "physio_desc1": "This is one of the most common misunderstandings: a ceiling fan does not lower the physical temperature (measured by a standard thermometer). Instead, it alters the <strong>perceived temperature</strong> by acting on the human body's heat regulation mechanisms.",
            
            "physio_title2": "Two major physical effects",
            "physio_desc2": "<strong>1. Evaporation acceleration (Primary effect):</strong> Our skin continuously evaporates a tiny film of water (sweat). The airflow speeds up this evaporation. This liquid-to-gas phase change is endothermic: it directly absorbs heat from our skin, producing an immediate drop in skin temperature.<br><br><strong>2. Forced convection:</strong> Our body naturally heats the air immediately surrounding it, creating a warm, insulating envelope of air (the boundary layer). The fan sweeps away this warm layer and replaces it with ambient room air (if it is cooler than body temperature, i.e., < 37°C), facilitating our body's heat dissipation.",
            
            "physio_title3": "The scientific rule of thumb (1 m/s = -3°C)",
            "physio_desc3": "Studies from Givoni's bioclimatic research and comfort standards (ASHRAE 55) agree on a major fact: an average air speed of <strong>1 m/s</strong> around occupants corresponds to a perceived cooling of <strong>2°C to 4°C</strong> less. Thus, at 30°C in a ventilated space, your body feels exactly as if it were 26°C or 27°C in a draft-free room.",

            // Tab 2: Energy & Costs contents
            "energy_title1": "The incredible energy efficiency of motion",
            "energy_desc1": "Thermodynamically, changing the overall temperature of thousands of cubic meters of air requires a massive amount of energy (involving a compressor and cooling cycle). Moving that same volume to cool only the bodies is infinitely more sober.",
            "energy_stat_ratio_num": "15x to 40x",
            "energy_stat_ratio_label": "Less energy than AC",
            "energy_stat_power_num": "15 to 35 W",
            "energy_stat_power_label": "Typical fan power",
            
            "energy_title2": "Direct consumption comparison (ADEME data)",
            "energy_table_th_criterion": "Criterion",
            "energy_table_th_ac": "Air Conditioner (12m² Bedroom)",
            "energy_table_th_fan": "Ceiling Fan",
            "energy_table_td_power_name": "Electrical power",
            "energy_table_td_power_ac": "1,000 W to 2,000 W",
            "energy_table_td_power_fan": "<strong>15 W to 35 W</strong> (DC Motor)",
            "energy_table_td_consumption_name": "Typical consumption",
            "energy_table_td_consumption_ac": "500 kWh / year",
            "energy_table_td_consumption_fan": "<strong>15 to 36 kWh / year</strong> (7% of AC!)",
            "energy_table_td_cost_name": "Running cost",
            "energy_table_td_cost_ac": "~120 € to 150 € / year",
            "energy_table_td_cost_fan": "<strong>~3 € to 8 € / year</strong>",
            "energy_table_td_carbon_name": "Carbon impact",
            "energy_table_td_carbon_ac": "High (refrigerant fluids + electricity)",
            "energy_table_td_carbon_fan": "<strong>Negligible</strong> (no fluids)",

            // Tab 3: AC Coupling contents
            "couplage_title1": "AC + Fan: The winning thermodynamic alliance",
            "couplage_desc1": "In humid tropical zones or during extreme heatwaves, ventilation alone may not suffice to reach the comfort zone. The ideal solution is not running the AC at full blast, but adopting a <strong>coupled operation</strong>.",
            "couplage_title2": "Raise the setpoint to divide bills",
            "couplage_desc2": "By running a ceiling fan simultaneously, the 2°C to 3°C cooling sensation allows you to set your air conditioning thermostat to <strong>27°C instead of 25°C</strong> (or 28°C instead of 26°C).<br><br>In building physics, <strong>each additional degree on the AC setpoint reduces energy consumption by 7% to 10%</strong>.",
            "couplage_title3": "Dynamic Thermal Simulation Results (ADEME - BRASSE)",
            "couplage_subtitle3": "Studies in Pointe-à-Pitre (Guadeloupe)",
            "couplage_desc3": "Dynamic thermal simulations (DTS) conducted within the public BRASSE program proved the effectiveness of this coupling:",
            "couplage_li1": "<strong>Case No. 1 (Bedroom):</strong> Coupling (AC set at 27°C + ceiling fan) reduces the annual AC bill by <strong>27%</strong> compared to AC alone set at 25°C. Fan consumption accounts for only 7% of the total.",
            "couplage_li2": "<strong>Case No. 2 (Tertiary Office):</strong> Raising the setpoint to 27°C with the fan generates <strong>20% energy savings</strong> over the year. The ceiling fan represents only 4% of office consumption.",

            // Tab 4: Seasons contents
            "saisons_title1": "Summer mode: Direct comfort by vertical flow",
            "saisons_desc1": "In summer (or permanent tropical climates), the fan rotates in the clockwise direct direction to push air downwards. This vertical airflow directly sweeps across the skin of occupants in the draft cone, maximizing cooling by sweat evaporation.",
            "saisons_title2": "Winter mode: Thermal destratification",
            "saisons_desc2": "It is an inescapable physical law: warm air (which is lighter) rises by natural convection and accumulates under the ceiling. In a high-ceilinged room, the temperature gap can reach 5°C to 10°C between the floor and the ceiling (a massive waste of energy!).<br><br>In winter, the ceiling fan is used for <strong>destratification</strong>:",
            "saisons_li1": "It generally runs in <strong>reverse mode (counter-clockwise)</strong> at low speed to push warm air towards the ceiling.",
            "saisons_li2": "The air spreads across the ceiling and gently descends along the walls without generating direct cold drafts on people.",
            "saisons_li3": "This homogenizes heat throughout the room, increasing comfort at floor level and reducing heating needs by about <strong>5% to 10%</strong>.",

            // Givoni zones dictionary
            "zone_comfort_name": "Natural Comfort Zone",
            "zone_comfort_statusText": "Optimal comfort",
            "zone_comfort_desc": "Ideal temperature and humidity. Metabolism regulates body heat without active assistance. Enjoy this passive comfort.",
            "zone_comfort_action": "✅ Perfect conditions. No active thermal treatment required.",
            "zone_comfort_fanLabel": "Ceiling fan stopped",
            "zone_comfort_fanDesc": "No ventilation required for thermal comfort.",

            "zone_ventilation_name": "Ceiling Fan Comfort Zone",
            "zone_ventilation_statusText": "Effective ventilation",
            "zone_ventilation_desc": "The sensation of heat is heavy or muggy. Moving air at 1 m/s creates an immediate cooling sensation of 2°C to 4°C, evaporating sweat and bringing the feeling back to the comfort zone.",
            "zone_ventilation_action": "🌀 Ceiling fan activated. Avoids 100% active air conditioning.",
            "zone_ventilation_fanLabel": "Ceiling fan activated (Speed 2-4)",
            "zone_ventilation_fanDesc": "Generates a cooling airflow of 0.6 to 1.0 m/s on the skin.",

            "zone_inertia_name": "Inertia & Night Ventilation",
            "zone_inertia_statusText": "Inertia recommended",
            "zone_inertia_desc": "Hot but very dry climate. Day heat can be absorbed by the building structure's inertia. Intensive ventilation at night cools the walls, which then release coolness during the day.",
            "zone_inertia_action": "🏢 Close windows during the day, ventilate heavily at night.",
            "zone_inertia_fanLabel": "Slow ceiling fan (Speed 1-2)",
            "zone_inertia_fanDesc": "Helps circulate dry air and homogenize temperature.",

            "zone_evaporative_name": "Evaporative Cooling",
            "zone_evaporative_statusText": "Adiabatic cooling",
            "zone_evaporative_desc": "Extremely hot and very dry climate. Adding moisture to the air (by misting or an evaporative cooler) absorbs calories through water's phase transition, dropping air temperature by several degrees.",
            "zone_evaporative_action": "💦 Optimal solution: Misting or adiabatic cooling.",
            "zone_evaporative_fanLabel": "Ceiling fan support",
            "zone_evaporative_fanDesc": "Helps distribute the air cooled by evaporation.",

            "zone_heating_name": "Heating required (or Destratification)",
            "zone_heating_statusText": "Cold climate",
            "zone_heating_desc": "Temperatures too low for lightly dressed bodies. If you heat the room, warm air will rise and pool at the ceiling. Run the ceiling fan at very low speed or in reverse rotation to bring this heat back down (destratification).",
            "zone_heating_action": "🔥 Turn on heating + Ceiling fan in destratification mode (reverse).",
            "zone_heating_fanLabel": "Winter Destratification Mode active",
            "zone_heating_fanDesc": "Brings down warm air pooled at the ceiling without creating cold drafts.",

            "zone_climatisation_name": "Air Conditioning required (Optimal AC + Fan coupling)",
            "zone_climatisation_statusText": "Cooling required",
            "zone_climatisation_desc": "Climate exceeds physiological limits of simple ventilation (extreme muggy heat or saturated humidity preventing sweat evaporation). Active air conditioning is required to dehumidify and cool the space.",
            "zone_climatisation_action": "❄️ Active air conditioning. Set the thermostat to 27°C and turn on the ceiling fan!",
            "zone_climatisation_fanLabel": "AC + Fan Coupling (Savings -25%)",
            "zone_climatisation_fanDesc": "Allows raising the AC thermostat by 2°C for identical comfort.",

            "chart_tooltip_format": "{0}°C, {1}% RH ({2} g/kg)",
            
            "diameter_range_label": "Acceptable range: {0} – {1} cm",
            "explanation_fan_position": "fan {0} at {1} m from the left wall and {2} m from the top wall",
            "facteur_de_forme_term": "form factor",
            "Standard": "Standard",
            "Low-profile": "Low-profile",
            "Flush": "Flush",
            "Non-compliant": "Non-compliant",

            "unit_toggle_title": "Change unit system",
            "unit_toggle_label": "Toggle between metric and imperial unit system",
            "unit_metric": "Metric",
            "unit_imperial": "Imperial",

            "givoni_x_axis_imp": "Dry Bulb Temperature (°F)",
            "givoni_y_axis_specific_imp": "Specific Humidity (grains water / lb dry air)",
            "givoni_y_axis_absolute_imp": "Absolute Humidity (grains/lb)",
            "chart_tooltip_format_imp": "{0}°F, {1}% RH ({2} grains/lb)",

            "card_diameter_imp": "Diameter (in)",
            "card_ce_imp": "Cooling effect (°F)",

            "metric_room_area_imp": "Room area (sq ft)",
            "metric_cell_dim_imp": "Cell dimensions (ft)",
            "metric_cell_area_imp": "Cell area (sq ft)",
            "metric_d_ideal_imp": "Ideal D (in)",
            "metric_d_range_imp": "Acceptable D range (in)",
            "metric_d_min_imp": "Min D (FCC=0.2)",
            "metric_d_max_fcc_imp": "Max D (FCC=0.4)",
            "metric_d_max_global_imp": "Global max D",
            "metric_h_mounting_imp": "Mounting H (ft)",
            "metric_h_blades_imp": "Blade H (floor) (ft)",
            "metric_v_air_imp": "Est. air speed (fpm)",

            "diameter_range_label_imp": "Acceptable range: {0} – {1} in",
            "explanation_fan_position_imp": "fan {0} at {1} ft from the left wall and {2} ft from the top wall",

            "explanation_single_cell_imp": "The room is treated as a single cell of {0} ft x {1} ft. The room's {2} is {3}, which remains compatible with a symmetrical layout without further partitioning.",
            "explanation_multi_cell_imp": "The {0} ft x {1} ft room is divided into {2} x {3} cells, representing {4} identical zones of {5} ft x {6} ft. This partitioning brings the {7} from {8} down to {9} per cell, shifting the layout closer to a regular configuration.",
            "explanation_single_placement_imp": "The ceiling fan is placed at the center of the room, at coordinates ({0} ft; {1} ft). This centered position maximizes diffusion symmetry and leaves {2} ft to the nearest wall.",
            "explanation_multi_placement_imp": "Each ceiling fan is placed at the center of its cell to maintain symmetry. Reading the layout from left to right, this yields: {0}. The smallest wall distance is {1} ft and the minimum inter-fan spacing is {2} ft.",
            "explanation_diameter_imp": "The calculated fan diameter selected by the application is {0} in. For this coverage area, a coherent diameter lies between {1} in and {2} in. The global maximum diameter is {3} in, limited primarily by {4}.",
            "explanation_market_imp": "Any diameter between {0} in and {1} in is suitable. The application selects the largest possible diameter ({2} in) to maximize comfort.",
            "explanation_mounting_imp": "The chosen mounting configuration is {0}. The blade rotation plane is positioned at {1} ft from the floor and {2} ft below the ceiling. This placement complies with the minimum safety clearance of {3} ft and {4}.",
            "explanation_performance_imp": "With this configuration, the application estimates an average air speed of approximately {0} fpm for a perceived cooling effect close to {1} °F. The selected mounting efficiency is {2}%."
        }
    },
    init() {
        const savedLang = localStorage.getItem('brasse-lang');
        if (savedLang === 'en' || savedLang === 'fr') {
            this.lang = savedLang;
        } else {
            const userLang = navigator.language || navigator.userLanguage;
            this.lang = userLang && userLang.startsWith('en') ? 'en' : 'fr';
        }
        const savedUnit = localStorage.getItem('brasse-unit');
        if (savedUnit === 'metric' || savedUnit === 'imperial') {
            this.unit = savedUnit;
        } else {
            this.unit = 'metric';
        }
        this.applyLanguage();
        this.applyUnits();
        this.setupSwitchers();
    },
    setLang(lang) {
        if (lang !== 'en' && lang !== 'fr') return;
        this.lang = lang;
        localStorage.setItem('brasse-lang', lang);
        this.applyLanguage();
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
    },
    setUnit(unit) {
        if (unit !== 'metric' && unit !== 'imperial') return;
        this.unit = unit;
        localStorage.setItem('brasse-unit', unit);
        this.applyLanguage(); // Re-apply to update text containing unit-aware key overrides
        this.applyUnits();
        window.dispatchEvent(new CustomEvent('unitchange', { detail: { unit } }));
    },
    applyLanguage() {
        document.documentElement.setAttribute('lang', this.lang);
        
        // Update active class on language buttons
        document.querySelectorAll('.lang-switcher').forEach(switcher => {
            switcher.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === this.lang);
            });
        });

        // Translate all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== undefined) {
                el.innerHTML = translation;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation !== undefined) {
                el.placeholder = translation;
            }
        });

        // Translate titles
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation !== undefined) {
                el.setAttribute('title', translation);
            }
        });

        // Translate aria-labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const translation = this.t(key);
            if (translation !== undefined) {
                el.setAttribute('aria-label', translation);
            }
        });

        // Update document title and meta description if elements exist
        const isGivoni = window.location.pathname.includes('givoni.html');
        const titleKey = isGivoni ? "givoni_title" : "meta_title";
        const descKey = isGivoni ? "givoni_desc" : "meta_desc";

        const metaTitle = this.t(titleKey);
        if (metaTitle && metaTitle !== titleKey) {
            document.title = metaTitle;
        }
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && this.t(descKey) !== descKey) {
            metaDesc.setAttribute('content', this.t(descKey));
        }
    },
    applyUnits() {
        document.querySelectorAll('.unit-switcher').forEach(switcher => {
            switcher.querySelectorAll('.unit-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-unit-sys') === this.unit);
            });
        });

        document.querySelectorAll('[data-unit]').forEach(el => {
            const type = el.getAttribute('data-unit');
            if (this.unit === 'metric') {
                if (type === 'length' || type === 'hsp') el.textContent = 'm';
                else if (type === 'diameter') el.textContent = 'cm';
                else if (type === 'area') el.textContent = 'm²';
                else if (type === 'speed') el.textContent = 'm/s';
                else if (type === 'temp') el.textContent = '°C';
                else if (type === 'spec_hum') el.textContent = 'g/kg';
            } else {
                if (type === 'length' || type === 'hsp') el.textContent = 'ft';
                else if (type === 'diameter') el.textContent = 'in';
                else if (type === 'area') el.textContent = 'sq ft';
                else if (type === 'speed') el.textContent = 'fpm';
                else if (type === 'temp') el.textContent = '°F';
                else if (type === 'spec_hum') el.textContent = 'gr/lb';
            }
        });
    },
    setupSwitchers() {
        document.querySelectorAll('.lang-switcher').forEach(switcher => {
            // Avoid duplicate listeners
            if (switcher.dataset.listenerAttached) return;
            switcher.dataset.listenerAttached = 'true';

            switcher.querySelectorAll('.lang-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selectedLang = btn.getAttribute('data-lang');
                    this.setLang(selectedLang);
                });
            });
        });

        document.querySelectorAll('.unit-switcher').forEach(switcher => {
            // Avoid duplicate listeners
            if (switcher.dataset.listenerAttached) return;
            switcher.dataset.listenerAttached = 'true';

            switcher.querySelectorAll('.unit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selectedUnit = btn.getAttribute('data-unit-sys');
                    this.setUnit(selectedUnit);
                });
            });
        });
    },
    t(key) {
        const unitKey = this.unit === 'imperial' ? `${key}_imp` : key;
        const translationsForLang = this.translations[this.lang];
        if (translationsForLang) {
            if (translationsForLang[unitKey] !== undefined) {
                return translationsForLang[unitKey];
            }
            if (translationsForLang[key] !== undefined) {
                return translationsForLang[key];
            }
        }
        return key;
    },
    format(str, ...args) {
        return str.replace(/{(\d+)}/g, (match, number) => {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    }
};
