# Cartes de Vœux Express

Cartes de Vœux Express crée de jolies cartes de vœux personnalisées directement dans Claude : anniversaire, remerciement, félicitations, fêtes ou bon rétablissement. Décris l'occasion et la personne, Claude choisit le style, écrit un message personnalisé et le met en forme, prêt à copier.

## Exemple

> Fais une carte d'anniversaire pour ma collègue Marie, elle adore le café. Signe Abdel.

## Contenu du plugin

- **Connecteur « Cartes de Vœux Express »** : serveur MCP distant à l'adresse `https://cartes-voeux-coral.vercel.app/mcp`, avec deux outils en lecture seule :
  - `list_card_styles` : liste les styles disponibles ;
  - `create_card` : met en forme la carte.
- **Skill `greeting-card`** : indique à Claude dans quel ordre appeler les outils, quelles informations demander et comment présenter la carte.

## Données envoyées

Pour créer une carte, Claude envoie au serveur ci-dessus le style, le destinataire, le titre, le message et la signature éventuelle. Le serveur renvoie la carte et ne stocke rien. Aucun autre service n'est appelé et aucun compte n'est nécessaire. Voir la [politique de confidentialité](https://github.com/abdelwehed/cartes-voeux/blob/main/PRIVACY.md).

## Licence

MIT — EI Abdelwahed Batnini
