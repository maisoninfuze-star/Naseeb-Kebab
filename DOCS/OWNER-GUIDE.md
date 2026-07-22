# Guide du propriétaire · Owner's Guide
### Naseeb Kabab

---

## 🔴 À faire en premier — Do this first

Le site est en ligne et fonctionne. Mais **onze choses** ne pouvaient pas être
devinées à partir des fichiers fournis, et elles sont visibles par vos clients
en ce moment. Voici la liste complète, par ordre d'importance.

*The site is live and working. But **eleven things** could not be determined
from the files provided, and your customers can see them right now. Here is the
full list, most important first.*

---

### 1. Les heures d'ouverture · Opening hours

**Ce que le client voit maintenant :** « Heures à confirmer — appelez-nous »,
au pied de page, sur la page Nous trouver, et dans le menu de navigation.

**Pourquoi c'est le plus important :** c'est la question numéro un que se pose
quelqu'un qui cherche un restaurant. Aucune heure n'a été inventée — une heure
fausse envoie un client devant une porte fermée.

**Ce qu'il nous faut :** vos heures pour chaque jour de la semaine.

---

### 2. Le contenu des trois combos · What is in the three platters

| Combo | Prix affiché |
|---|---|
| Combo Dostan | 51,70 $ |
| Naseeb Combo | 104,50 $ |
| Watan Combo | 161,70 $ |

**Ce que le client voit maintenant :** le nom, le vrai prix, et « Le contenu
exact de cette assiette sera confirmé par le restaurant ».

**Pourquoi :** votre menu en ligne ne publie pas le contenu de ces assiettes, et
il n'existe aucune photo. Personne ne va dépenser 161 $ sans savoir ce qu'il
reçoit. **C'est probablement l'argent le plus facile à récupérer sur tout le
site.**

**Ce qu'il nous faut :** la liste des plats de chaque combo, le nombre de
personnes si vous le confirmez, et **une photo de chaque assiette**.

---

### 3. Sultan Kabab ou Mazar Kabab ? · Which is which?

Vos photos comprennent plusieurs grandes assiettes mixtes. **Sultan Kabab
(25,30 $) et Mazar Kabab (23,10 $) sont impossibles à distinguer sur une
photo**, et votre menu ne publie pas leur contenu.

Le site utilise notre meilleure hypothèse. Elle est peut-être inversée.

👉 Ouvrez **`/admin/menu`** : chaque plat affiche la photo qui lui est
actuellement associée, avec une étiquette `high`, `medium` ou `low`.
**Vérifiez toutes les étiquettes `low` et `medium`.**

Les mêmes questions se posent pour :
- **Mantu et Ashak** — deux plats de dumplings ont été photographiés. Sont-ils
  dans le bon ordre ?
- **Les currys et ragoûts** — sept plats se ressemblent beaucoup en photo :
  Dopiaza, Kofta Pulao, Sabzi Pulao, Qorma Pulao, Qorma de poulet, Qorma de
  veau, Banjan Burani.
- **Tikka Kabab (19 $) ou Kabab au poulet (17 $)** — même photo possible.

---

### 4. Les descriptions des plats · Dish descriptions

**Ce que le client voit maintenant :** le nom et le prix seulement.

**Pourquoi :** votre menu en ligne ne contient aucune description. Rien n'a été
écrit à votre place — décrire un plat afghan de travers est pire que de ne rien
écrire du tout.

**Ce qu'il nous faut :** une ou deux phrases par plat, en français. Commencez
par les 15 plats les plus vendus ; le reste peut suivre.

---

### 5. Les 17 plats sans photo · 17 dishes with no photograph

Samosa · Naan afghan · Salade afghane · Salade maison · Soupe aux lentilles ·
les 3 combos · les 5 burgers et wraps · l'eau, le soda, le dogh et le thé
afghan.

Ils apparaissent au menu avec leur prix, sans image.

---

### 6. La commande en ligne · Online ordering

**Ce que le client voit maintenant :** tous les boutons « Commander »
composent votre numéro de téléphone.

Si vous utilisez une plateforme (UberEats, DoorDash, Skip, votre propre
système), envoyez-nous le lien. Les boutons redirigeront alors automatiquement,
en conservant le suivi des campagnes publicitaires.

---

### 7. Instagram et Facebook

La section « Nous suivre » du pied de page affiche un tiret. Envoyez-nous les
adresses complètes.

---

### 8. Halal — à confirmer par écrit

**Le mot « halal » n'apparaît nulle part sur le site.**

C'est volontaire. C'est une affirmation qu'un client peut vérifier, et une
erreur ici coûte cher en confiance. Dès que vous nous le confirmez par écrit,
nous l'ajoutons — c'est un argument de vente important à Laval.

---

### 9. Votre histoire · Your story

La page **Notre histoire** est actuellement une page d'attente honnête. Il nous
faut, dans vos mots :

- Comment le restaurant a commencé
- La famille derrière le restaurant
- Ce qui vous a inspiré cette cuisine
- **Ce que le mot « Naseeb » signifie pour vous**
- Votre lien avec l'Afghanistan
- L'année d'ouverture

C'est ce qui distingue un restaurant d'un menu. Une histoire inventée aurait été
facile à écrire et sans valeur.

---

### 10. Les avis Google · Google reviews

La section des avis est construite mais **vide**. Aucun faux avis n'a été créé —
au Canada, publier de faux avis est une pratique commerciale trompeuse au sens
de la *Loi sur la concurrence*.

---

### 11. Deux mentions légales à compléter

Dans la **Politique de confidentialité** :
- Le **responsable de la protection des renseignements personnels** (nom et
  coordonnées) — **obligatoire** en vertu de la Loi 25 du Québec.
- La **région d'hébergement** des données.

Elles apparaissent en couleur sur la page, entre crochets.

---

## Photos et stationnement — ce qui manque aussi

Vos 119 photos sont excellentes, mais elles montrent **uniquement des assiettes**.
Il n'y a **aucune** photo de :

- la salle, la devanture, l'enseigne
- le gril, le charbon, la cuisine
- des mains qui préparent, du personnel, des clients

C'est pourquoi la section « Grillé sur charbon de bois » raconte le feu par la
lumière plutôt que par des images de gril. Une demi-journée de photos de la
salle et du gril transformerait trois sections du site.

Confirmez aussi le **stationnement** — la section est masquée tant que ce n'est
pas confirmé.

---

## Le tableau de bord · The dashboard

Adresse : **`/admin`** — jamais dans le menu, jamais dans Google.

| Page | À quoi ça sert |
|---|---|
| **Aperçu** | La liste complète de ce qui reste à confirmer |
| **Menu** | Chaque plat avec sa photo actuelle et son niveau de certitude |
| **Demandes** | Les demandes de traiteur reçues + export CSV |
| **Réglages** | Ce qui est confirmé, et ce qui manque encore |

Sans Supabase, le tableau de bord fonctionne en lecture seule. Aucun bouton
« Enregistrer » qui ne sauvegarde rien n'a été ajouté.

---

## Une note sur Laval

Votre brief mentionnait Montréal. **Le restaurant est à Laval**, et le site est
optimisé pour Laval en premier, Montréal en second.

C'est délibéré. Se positionner sur « restaurant afghan Montréal » depuis une
adresse lavalloise est la façon la plus courante de gaspiller un budget de
référencement local : Google sert les résultats selon la position réelle du
client, et vos voisins de Laval, Chomedey, Sainte-Dorothée et Laval-des-Rapides
sont ceux qui viendront ce soir.
