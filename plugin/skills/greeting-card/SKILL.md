---
name: greeting-card
description: Comment créer une carte de vœux avec les outils list_card_styles et create_card du connecteur Cartes de vœux. À utiliser dès que l'utilisateur veut écrire, créer ou envoyer une carte, un mot ou un message d'anniversaire, de remerciement, de félicitations, de fêtes ou de bon rétablissement.
---

# Créer une carte de vœux

## Ordre des appels

1. Appelle toujours `list_card_styles` en premier, même si tu crois connaître les styles. Ne devine jamais un identifiant de style.
2. Choisis le style qui correspond à l'occasion. Si aucun ne correspond vraiment, propose les deux plus proches à l'utilisateur.
3. Appelle ensuite `create_card`.

## Avant d'appeler `create_card`

- **Destinataire** : s'il n'est pas donné, demande-le en une seule question courte. N'invente pas de prénom.
- **Signature** : facultative. Ne l'invente pas ; si l'utilisateur ne l'a pas donnée, omets-la.
- **Titre** : adapte le `suggestedTitle` du style dans la langue de l'utilisateur (par exemple « Joyeux anniversaire ! »).
- **Message** :
  - écris-le dans la langue de l'utilisateur ;
  - respecte le `tone` du style ;
  - reste sous `maxWords` mots (vise environ 80 % de la limite) ;
  - utilise les détails personnels que l'utilisateur a donnés (souvenir, qualité, projet) plutôt que des formules génériques.

## Si l'outil renvoie une erreur de longueur

Raccourcis le message et rappelle `create_card` une seule fois. Ne demande pas à l'utilisateur de le faire.

## Présentation du résultat

- Affiche la carte telle que l'outil la renvoie, dans un bloc de code pour garder la mise en forme.
- En une phrase, propose ensuite une variante (plus drôle, plus sobre ou plus courte).
- N'affiche pas la liste brute des styles à l'utilisateur sauf s'il la demande.
