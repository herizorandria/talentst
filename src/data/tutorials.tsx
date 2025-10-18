import React from 'react';
import { 
  Link, 
  Settings, 
  Eye, 
  Shield, 
  Zap, 
  QrCode, 
  BarChart3, 
  History,
  Copy,
  ExternalLink,
  Calendar,
  Tag,
  Globe
} from 'lucide-react';

export const tutorials = [
  {
    id: 'getting-started',
    title: 'Premiers pas avec ShortLink Pro',
    description: 'Apprenez les bases pour créer votre premier lien raccourci et découvrir les fonctionnalités principales.',
    duration: '5 min',
    difficulty: 'Débutant' as const,
  icon: <Link className="h-5 w-5 text-yellow-400" />,
    stepsCount: 4,
    steps: [
      {
        id: 'welcome',
        title: 'Bienvenue dans ShortLink Pro',
        description: 'Découvrez l\'interface principale et les onglets disponibles.',
        icon: <Link className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Interface principale</h4>
              <p className="text-sm text-gray-600 mb-3">
                L'application est organisée en 4 onglets principaux :
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <Link className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">Raccourcir</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <Settings className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Gérer</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <History className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Historique</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Statistiques</span>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Utilisez les onglets pour naviguer entre les différentes fonctionnalités',
          'Votre profil utilisateur est accessible en haut à droite'
        ]
      },
      {
        id: 'create-first-link',
        title: 'Créer votre premier lien',
        description: 'Apprenez à raccourcir une URL en quelques clics.',
        icon: <Link className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Étapes pour créer un lien :</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-400">1</div>
                  <div>
                    <p className="font-medium">Collez votre URL</p>
                    <p className="text-sm text-gray-600">Dans le champ "https://example.com/..."</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-400">2</div>
                  <div>
                    <p className="font-medium">Personnalisez (optionnel)</p>
                    <p className="text-sm text-gray-600">Ajoutez un code personnalisé ou laissez vide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-400">3</div>
                  <div>
                    <p className="font-medium">Cliquez sur "Raccourcir"</p>
                    <p className="text-sm text-gray-600">Votre lien sera créé instantanément</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Les URLs doivent commencer par http:// ou https://',
          'Les codes personnalisés ne peuvent contenir que des lettres, chiffres et tirets'
        ]
      },
      {
        id: 'copy-share',
        title: 'Copier et partager',
        description: 'Découvrez comment utiliser votre lien raccourci.',
        icon: <Copy className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Actions disponibles :</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border rounded">
                  <Copy className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Copier le lien dans le presse-papiers</span>
                </div>
                <div className="flex items-center gap-3 p-2 border rounded">
                  <QrCode className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Télécharger le QR Code</span>
                </div>
                <div className="flex items-center gap-3 p-2 border rounded">
                  <ExternalLink className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">Tester le lien dans un nouvel onglet</span>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Le QR Code est parfait pour partager sur mobile',
          'Testez toujours vos liens avant de les partager'
        ]
      },
      {
        id: 'track-stats',
        title: 'Suivre les statistiques',
        description: 'Apprenez à consulter les clics et performances de vos liens.',
        icon: <BarChart3 className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Métriques disponibles :</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-lg font-bold text-orange-600">0</div>
                  <div className="text-xs text-orange-700">Clics totaux</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">0</div>
                  <div className="text-xs text-green-700">Liens créés</div>
                </div>
                <div className="p-3 bg-amber-50 rounded">
                  <div className="text-lg font-bold text-yellow-400">0</div>
                  <div className="text-xs text-amber-700">Moyenne/lien</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-lg font-bold text-orange-600">0</div>
                  <div className="text-xs text-orange-700">Aujourd'hui</div>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Les statistiques se mettent à jour en temps réel',
          'Consultez l\'onglet "Statistiques" pour plus de détails'
        ]
      }
    ]
  },
  {
    id: 'advanced-features',
    title: 'Fonctionnalités avancées',
    description: 'Maîtrisez les options avancées : mots de passe, expiration, liens directs et tags.',
    duration: '8 min',
    difficulty: 'Intermédiaire' as const,
    icon: <Settings className="h-5 w-5 text-orange-600" />,
    stepsCount: 5,
    steps: [
      {
        id: 'advanced-options',
        title: 'Options avancées',
        description: 'Découvrez le panneau des options avancées.',
        icon: <Settings className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Accéder aux options avancées :</h4>
              <p className="text-sm text-gray-600 mb-3">
                Cliquez sur le bouton "Options avancées" sous le formulaire principal pour révéler :
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>Description personnalisée</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>Tags pour l'organisation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span>Protection par mot de passe</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Date d'expiration</span>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Les options avancées sont facultatives mais très utiles',
          'Vous pouvez combiner plusieurs options sur un même lien'
        ]
      },
      {
        id: 'password-protection',
        title: 'Protection par mot de passe',
        description: 'Sécurisez vos liens avec un mot de passe.',
        icon: <Shield className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Protéger un lien :</h4>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-sm text-orange-800">
                    <strong>Quand utiliser :</strong> Pour des documents confidentiels, 
                    des liens privés ou du contenu sensible.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Exemple de mot de passe :</label>
                  <div className="p-2 bg-gray-100 rounded font-mono text-sm">
                    MonMotDePasse123!
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Le mot de passe doit contenir au moins 6 caractères.
                </p>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Utilisez des mots de passe forts et uniques',
          'Partagez le mot de passe séparément du lien',
          'Les mots de passe sont chiffrés en base de données'
        ]
      },
      {
        id: 'direct-links',
        title: 'Liens directs',
        description: 'Créez des liens qui redirigent immédiatement.',
        icon: <Zap className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Lien direct vs Normal :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <h5 className="font-medium text-orange-800 mb-2">Lien Normal</h5>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Page de confirmation</li>
                    <li>• Détection de bots</li>
                    <li>• Compteur visible</li>
                    <li>• Plus sécurisé</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <h5 className="font-medium text-green-800 mb-2">Lien Direct</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Redirection immédiate</li>
                    <li>• Pas d'intermédiaire</li>
                    <li>• Plus rapide</li>
                    <li>• Idéal pour l'API</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Utilisez les liens directs pour les intégrations automatiques',
          'Les liens normaux offrent plus de sécurité et de contrôle'
        ]
      },
      {
        id: 'expiration',
        title: 'Date d\'expiration',
        description: 'Configurez l\'expiration automatique de vos liens.',
        icon: <Calendar className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Cas d'usage pour l'expiration :</h4>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h5 className="font-medium text-yellow-800">Promotions temporaires</h5>
                  <p className="text-sm text-yellow-700">
                    Liens vers des offres limitées dans le temps
                  </p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <h5 className="font-medium text-red-800">Documents temporaires</h5>
                  <p className="text-sm text-red-700">
                    Accès limité à des fichiers sensibles
                  </p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <h5 className="font-medium text-orange-800">Événements</h5>
                  <p className="text-sm text-orange-700">
                    Liens d'inscription qui ferment automatiquement
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Les liens expirés affichent un message d\'erreur',
          'Vous pouvez voir les liens expirés dans l\'onglet "Gérer"',
          'L\'expiration est vérifiée à chaque accès'
        ]
      },
      {
        id: 'tags-organization',
        title: 'Organisation avec les tags',
        description: 'Utilisez les tags pour organiser vos liens.',
        icon: <Tag className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Exemples de tags :</h4>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">marketing</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">social</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">campagne-2024</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">urgent</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2"><strong>Bonnes pratiques :</strong></p>
                  <ul className="space-y-1">
                    <li>• Séparez les tags par des virgules</li>
                    <li>• Utilisez des noms courts et descriptifs</li>
                    <li>• Créez une convention de nommage</li>
                    <li>• Groupez par projet, client ou campagne</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Les tags facilitent la recherche dans l\'onglet "Gérer"',
          'Vous pouvez filtrer par tags dans les statistiques',
          'Utilisez des tags cohérents pour une meilleure organisation'
        ]
      }
    ]
  },
  {
    id: 'management-analytics',
    title: 'Gestion et Analytics',
    description: 'Apprenez à gérer efficacement vos liens et analyser leurs performances.',
    duration: '10 min',
    difficulty: 'Avancé' as const,
    icon: <BarChart3 className="h-5 w-5 text-green-600" />,
    stepsCount: 4,
    steps: [
      {
        id: 'links-management',
        title: 'Gestion des liens',
        description: 'Maîtrisez l\'onglet de gestion pour organiser vos liens.',
        icon: <Settings className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Fonctionnalités de gestion :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-800">Recherche et filtres</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Recherche par URL, code ou description</li>
                    <li>• Filtre par type (protégé, direct, expiré)</li>
                    <li>• Tri par date ou popularité</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-800">Actions rapides</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Copier le lien raccourci</li>
                    <li>• Ouvrir l'URL originale</li>
                    <li>• Supprimer définitivement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Utilisez la recherche pour retrouver rapidement un lien',
          'Les filtres vous aident à identifier les liens problématiques',
          'Supprimez régulièrement les liens inutiles'
        ]
      },
      {
        id: 'analytics-overview',
        title: 'Vue d\'ensemble des analytics',
        description: 'Comprenez les métriques et statistiques disponibles.',
        icon: <BarChart3 className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Métriques principales :</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">156</div>
                  <div className="text-sm text-orange-700">Total des liens</div>
                  <div className="text-xs text-orange-600 mt-1">Tous vos liens créés</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">2,847</div>
                  <div className="text-sm text-green-700">Total des clics</div>
                  <div className="text-xs text-green-600 mt-1">Engagement global</div>
                </div>
                <div className="p-3 bg-amber-50 rounded">
                  <div className="text-2xl font-bold text-yellow-400">18</div>
                  <div className="text-sm text-amber-700">Moyenne par lien</div>
                  <div className="text-xs text-yellow-400 mt-1">Performance moyenne</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-orange-700">Créés aujourd'hui</div>
                  <div className="text-xs text-orange-600 mt-1">Activité récente</div>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Surveillez la moyenne de clics pour identifier les liens performants',
          'Un pic d\'activité peut indiquer un partage viral',
          'Comparez les performances par période'
        ]
      },
      {
        id: 'top-performers',
        title: 'Liens les plus performants',
        description: 'Identifiez et analysez vos liens les plus populaires.',
        icon: <Eye className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Top 3 des liens populaires :</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold flex items-center justify-center">1</div>
                    <div>
                      <code className="text-sm font-mono bg-black px-2 py-1 rounded">promo-noel</code>
                      <p className="text-xs text-gray-600 mt-1">https://boutique.example.com/promo-noel-2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">847</p>
                    <p className="text-xs text-gray-500">clics</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-400 text-white rounded-full text-sm font-bold flex items-center justify-center">2</div>
                    <div>
                      <code className="text-sm font-mono bg-black px-2 py-1 rounded">blog-seo</code>
                      <p className="text-xs text-gray-600 mt-1">https://blog.example.com/guide-seo-2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">234</p>
                    <p className="text-xs text-gray-500">clics</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 text-white rounded-full text-sm font-bold flex items-center justify-center">3</div>
                    <div>
                      <code className="text-sm font-mono bg-black px-2 py-1 rounded">demo-app</code>
                      <p className="text-xs text-gray-600 mt-1">https://demo.example.com/nouvelle-app</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">189</p>
                    <p className="text-xs text-gray-500">clics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Analysez pourquoi certains liens performent mieux',
          'Reproduisez les stratégies des liens populaires',
          'Surveillez les tendances saisonnières'
        ]
      },
      {
        id: 'optimization-tips',
        title: 'Conseils d\'optimisation',
        description: 'Maximisez l\'efficacité de vos liens raccourcis.',
        icon: <Globe className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="bg-black border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Meilleures pratiques :</h4>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <h5 className="font-medium text-green-800 mb-2">✅ À faire</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Utilisez des codes personnalisés mémorables</li>
                    <li>• Ajoutez des descriptions claires</li>
                    <li>• Organisez avec des tags cohérents</li>
                    <li>• Testez vos liens avant partage</li>
                    <li>• Surveillez les performances régulièrement</li>
                  </ul>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <h5 className="font-medium text-red-800 mb-2">❌ À éviter</h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Codes trop complexes ou aléatoires</li>
                    <li>• Liens sans description ni contexte</li>
                    <li>• Partage de liens non testés</li>
                    <li>• Accumulation de liens inutiles</li>
                    <li>• Ignorer les statistiques</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Un bon code personnalisé améliore la confiance',
          'Les descriptions aident à retrouver les liens plus tard',
          'Nettoyez régulièrement vos liens inactifs'
        ]
      }
    ]
  }
];

export const getTutorialById = (id: string) => {
  return tutorials.find(tutorial => tutorial.id === id);
};