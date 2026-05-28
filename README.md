# Brasseur d'Air

Application web statique de dimensionnement et de placement de brasseurs d'air plafonniers, basée sur une lecture opérationnelle des publications ADEME du programme BRASSE.

[Accéder à l'application](https://guilamu.github.io/brasseur-dair/)

L'objectif du projet est de proposer un outil simple, pédagogique et directement exploitable pour estimer un calepinage cohérent, visualiser les contraintes principales et comparer un choix théorique avec les diamètres disponibles sur le marché.

Important : ce projet est une implémentation indépendante. Il ne constitue pas un outil officiel ADEME, SURYA Consultants, Envirobat BDM, ISEA Projects ou LASA, et n'engage pas ses auteurs scientifiques.

## Fonctionnalités

- Calcul automatique du nombre de brasseurs, de leur diamètre et de leur implantation.
- Mode `Couverture uniforme de la pièce` pour viser une diffusion régulière sur l'ensemble du local.
- Mode `Zone de couchage contre un mur` pour un confort local ciblé sur une zone type de `2,5 x 2,5 m`.
- Choix d'un usage parmi plusieurs profils : chambre, séjour, bureau, scolaire, sport.
- Saisie optionnelle d'un diamètre manuel avec bascule en mode diagnostic si une ou plusieurs contraintes ne sont pas respectées.
- Vérification détaillée des contraintes géométriques et de montage.
- Explication textuelle du choix retenu par l'application.
- Vue en plan et vue en coupe avec mise en évidence des contraintes non respectées en mode diagnostic.
- Affichage des diamètres du marché compatibles avec l'enveloppe calculée.
- Estimation de la vitesse d'air et de l'effet rafraîchissant.

## Ce que calcule l'application

Entrées utilisateur :

- Longueur de la pièce.
- Largeur de la pièce.
- Hauteur sous plafond.
- Type d'activité / usage.
- Mode de couverture.
- Diamètre manuel optionnel.

Sorties principales :

- Nombre de brasseurs.
- Diamètre calculé.
- Diamètre de marché compatible quand il existe.
- Type de montage.
- Effet rafraîchissant estimé.
- Vérification des contraintes.
- Visualisation du placement et de la coupe.
- Explication textuelle du résultat.

## Hypothèses et périmètre

- Le projet est une traduction applicative des règles de calepinage et des données publiques BRASSE / BRASSE II.
- L'effet rafraîchissant est une estimation simplifiée à partir d'une vitesse d'air cible et d'un ajustement logarithmique utilisé dans l'application.
- Le mode `Zone de couchage contre un mur` repose sur une hypothèse simplifiée de zone type `2,5 x 2,5 m`.
- Les diamètres de marché actuellement intégrés sont : `70`, `80`, `90`, `107`, `122`, `132`, `142`, `152`, `166` cm.
- En mode diamètre manuel, le rendu de diagnostic aide à comprendre pourquoi une implantation ne respecte pas les contraintes, mais ne remplace pas une validation de conception par un professionnel.

## Lancer l'application en local

### Option 1 - ouverture directe

Ouvrir le fichier `app/index.html` dans un navigateur moderne.

### Option 2 - petit serveur local

Depuis la racine du projet :

```powershell
Set-Location app
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

Navigateurs conseillés : versions récentes de Chrome, Edge ou Firefox.

## Structure du projet

```text
app/
  app.js        logique de calcul et interactions UI
  index.html    structure de l'application
  styles.css    styles et animations
  fan.svg       icône du ventilateur du header
```

## Références et crédits

Cette application s'appuie principalement sur les publications ADEME suivantes :

1. [BRASSE, Brasseurs d'air, une solution de sobriété et d'efficacité](https://librairie.ademe.fr/energies/6791-brasse.html)
   Crédits auteurs indiqués sur la page ADEME : Envirobat BDM, Surya Consultants, ISEA Projects, ADEME.

2. [BRASSE II : Base de données des performances de 50 brasseurs d'air plafonniers à pales](https://librairie.ademe.fr/batiment/9035-brasse-ii-base-de-donnees-des-performances-de-50-brasseurs-d-air-plafonniers-a-pales.html)
   Crédits auteurs indiqués sur la page ADEME : Surya Consultants, LASA.

Sources de travail complémentaires utilisées pour cette application :

- le document local `application/specs_app_brasseur.md`, qui consolide les règles et hypothèses retenues dans cette implémentation ;
- le support de formation SURYA Ingénierie autour du confort thermique et des brasseurs d'air, notamment `Qu’est-ce que le confort ? Comment le brasseur améliore le confort ressenti` ;
- les documents PDF de travail présents dans ce workspace.

## Positionnement du projet

- Projet indépendant et non officiel.
- Vocation pédagogique et opérationnelle.
- Utilisable pour explorer des ordres de grandeur et des implantations cohérentes.
- Ne se substitue pas à une étude complète d'exécution, à une validation réglementaire ou à un choix constructeur.

## Limites connues

- Les données BRASSE II embarquées sont exploitées sous forme de règles et de seuils simplifiés, pas comme une reproduction exhaustive de toute la base.
- Le confort réel dépend d'autres paramètres non saisis ici : humidité, température moyenne radiante, vêture, comportement des occupants, géométrie fine du local, obstacles, etc.
- L'application ne gère pas encore de plan irrégulier, de plusieurs zones libres personnalisées ni de catalogue produit détaillé.

## Licence

Ce projet est distribué sous licence GNU Affero General Public License v3.0.

Consulter le fichier [LICENSE](LICENSE) pour le texte complet de la licence.

Cette licence est cohérente avec un projet open source destiné à être diffusé largement, y compris lorsqu'il est utilisé au travers d'un service en ligne.

## Historique

### [0.9] - 2026-05-28

- Première version publiable de l'application web statique `Brasseur d'Air`.
- Interface de saisie en temps réel pour les dimensions, l'usage, le mode de couverture et le diamètre manuel optionnel.
- Algorithme de dimensionnement basé sur les règles de calepinage BRASSE et les données exploitées depuis BRASSE II.
- Mode `Couverture uniforme de la pièce`.
- Mode `Zone de couchage contre un mur` pour le confort local ciblé.
- Estimation de la vitesse d'air et de l'effet rafraîchissant.
- Vérification détaillée des contraintes avec accordéon ouvert automatiquement en cas d'échec.
- Explication textuelle du choix retenu.
- Vue en plan et vue en coupe avec mise en évidence visuelle des contraintes non respectées en mode diagnostic.
- Diagnostic spécifique quand un diamètre manuel est saisi et sort de l'enveloppe compatible.
- Affichage des diamètres disponibles sur le marché avec recommandation visuelle.
- Note d'usage recommandant une fixation sur rotule/pivot pour l'acoustique et la pérennité.
- Footer de crédits avec liens vers les publications ADEME BRASSE et BRASSE II.
- Header documenté, avec lien interne vers les crédits du footer.

#### Notes

- Cette version est une implémentation indépendante fondée sur des travaux publics ADEME / BRASSE.
- Elle doit être considérée comme un outil d'aide et non comme une validation de conception définitive.
