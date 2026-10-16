# FraudWatch — Monitoring et Analyse des Transactions Bancaires

## Présentation

**FraudWatch** est une application web de monitoring et d'exploration des transactions du dataset **IEEE-CIS Fraud Detection**, développée dans le cadre d'un projet universitaire Big Data.

Elle permet de :
- Visualiser les indicateurs clés (KPIs) des transactions en temps réel.
- Explorer et filtrer les transactions avec pagination côté backend.
- Analyser la distribution des fraudes confirmées (labels historiques).
- Surveiller l'état de la connexion à MongoDB et les performances des endpoints.
- Fonctionner en **mode démonstration** avec des données simulées lorsque MongoDB est vide.

> **Note importante :** Le champ `isFraud` est un **label historique** du dataset d'entraînement IEEE-CIS. Il ne représente pas une prédiction produite par un modèle de Machine Learning. Les labels du jeu de test ne sont pas disponibles.

---

## Architecture

```
fraudwatch/
├── backend/   → c:\Users\hp 830 G3\Desktop\Fraud_backend
│              Spring Boot 3.2, Java 17, MongoDB, Maven
└── frontend/  → c:\Users\hp 830 G3\Desktop\Fraud_front
               React 19, TypeScript, Vite, Material UI v9
```

### Backend — Structure des packages

```
src/main/java/com/fraudwatch/backend/
├── config/       # CorsConfig, MongoConfig, DemoDataGenerator, SecurityConfig
├── controller/   # DashboardController, TransactionController, MonitoringController, HealthController
├── service/      # DashboardService, TransactionService, MonitoringService
├── repository/   # TransactionRepository, TransactionRepositoryCustom, TransactionRepositoryImpl
├── document/     # Transaction (document MongoDB)
├── dto/          # TransactionDto, DashboardSummaryDto, MonitoringStatusDto, PagedResponseDto, ...
├── mapper/       # TransactionMapper
└── exception/    # GlobalExceptionHandler, ResourceNotFoundException, InvalidFilterException
```

### Frontend — Structure des répertoires

```
src/
├── api/          # axiosInstance, transactionApi, dashboardApi, monitoringApi
├── components/
│   ├── charts/   # TransactionTrendChart, FraudDistributionChart, AmountDistributionChart
│   ├── common/   # KpiCard, LoadingSpinner, ErrorAlert, EmptyState, DemoModeBanner
│   └── layout/   # Sidebar, TopBar, MainLayout
├── hooks/        # useAutoRefresh, useDashboard, useTransactions, useMonitoring
├── pages/        # Dashboard, Transactions, TransactionDetail, FraudAnalysis, Monitoring, NotFound
├── types/        # api.ts, transaction.ts, dashboard.ts, monitoring.ts
└── utils/        # constants.ts, formatters.ts
```

---

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Java | 17+ |
| Node.js | 18+ |
| MongoDB | 6+ |
| Maven | 3.9+ |

---

## Variables d'environnement

### Backend (`application.properties` ou variables système)

| Variable | Défaut | Description |
|---|---|---|
| `SPRING_DATA_MONGODB_URI` | `mongodb://localhost:27017/fraudwatch` | URI de connexion MongoDB |
| `SECURITY_PASSWORD` | `changeme` | Mot de passe de l'utilisateur admin Spring Security |

### Frontend (fichier `.env`)

| Variable | Défaut | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL de base de l'API backend |

---

## Démarrage Backend

```bash
cd "c:\Users\hp 830 G3\Desktop\Fraud_backend"
mvn spring-boot:run
```

Le backend est accessible sur **http://localhost:8080**.

Pour utiliser une base MongoDB distante ou un mot de passe personnalisé :

```bash
SPRING_DATA_MONGODB_URI=mongodb://user:pass@host:27017/fraudwatch \
SECURITY_PASSWORD=motdepasse_securise \
mvn spring-boot:run
```

---

## Démarrage Frontend

```bash
cd "c:\Users\hp 830 G3\Desktop\Fraud_front"
cp .env.example .env          # Copier la configuration par défaut
npm install
npm run dev
```

Le frontend est accessible sur **http://localhost:5173**.

---

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/health` | Vérification de l'état du serveur (`status: UP`, timestamp) |
| `GET` | `/api/dashboard/summary` | Indicateurs globaux : total transactions, fraudes, légitimes, taux de fraude, montant total |
| `GET` | `/api/dashboard/transaction-trends?period=daily` | Évolution du volume des transactions par période (`daily`) |
| `GET` | `/api/dashboard/fraud-distribution` | Répartition fraude / légitime / inconnu |
| `GET` | `/api/transactions` | Liste paginée des transactions avec filtres (`page`, `size`, `minAmt`, `maxAmt`, `isFraud`, `transactionId`, `sortBy`, `sortDir`) |
| `GET` | `/api/transactions/{transactionId}` | Détails complets d'une transaction par son identifiant |
| `GET` | `/api/transactions/export` | Export CSV des transactions filtrées (même filtres que la liste, maximum 10 000 lignes) |
| `GET` | `/api/monitoring/status` | État de la connexion MongoDB, nombre de documents, temps de réponse, dernière actualisation |

### Paramètres de filtrage (`GET /api/transactions`)

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | int (≥ 0) | Numéro de page (défaut : 0) |
| `size` | int (1–100) | Taille de page (défaut : 20) |
| `minAmt` | double | Montant minimum |
| `maxAmt` | double | Montant maximum |
| `isFraud` | int (0 ou 1) | Filtrer par label de fraude |
| `transactionId` | string | Recherche par identifiant de transaction |
| `sortBy` | string | Champ de tri : `transactionDT`, `transactionAmt`, `transactionId`, `isFraud` |
| `sortDir` | string | Direction : `ASC` ou `DESC` (défaut : `DESC`) |

---

## Mode Démonstration

Lorsque la collection MongoDB est vide **et** que `app.demo-mode.enabled=true` (activé par défaut), l'API génère **500 transactions simulées** de manière déterministe (graine aléatoire fixe).

Toutes les réponses en mode démo incluent le champ `"demoMode": true`.

Le frontend affiche une **bannière orange** informant l'utilisateur que les données sont simulées.

Pour désactiver le mode démo et forcer l'utilisation de MongoDB uniquement :

```properties
# application.properties
app.demo-mode.enabled=false
```

---

## Tests

```bash
# Backend (15 tests — JUnit 5 + Mockito)
cd "c:\Users\hp 830 G3\Desktop\Fraud_backend"
mvn test

# Frontend
cd "c:\Users\hp 830 G3\Desktop\Fraud_front"
npm test
```

### Couverture des tests backend

| Classe testée | Tests | Résultat |
|---------------|-------|----------|
| `TransactionControllerTest` | 6 | ✅ PASSÉ |
| `DashboardServiceTest` | 3 | ✅ PASSÉ |
| `TransactionServiceTest` | 6 | ✅ PASSÉ |
| **Total** | **15** | **0 échec** |

> Les tests backend ne nécessitent pas de connexion MongoDB : les controllers utilisent `@WebMvcTest` + `@MockBean`, les services utilisent des mocks Mockito.

---

## Pages de l'application

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | 6 KPIs, 3 graphiques (tendances, distribution fraude, montants), tableau des dernières transactions, auto-refresh 30 s |
| Explorateur | `/transactions` | Tableau filtrable et triable, pagination backend, export CSV |
| Détail transaction | `/transactions/:id` | Tous les champs de la transaction regroupés par catégorie |
| Analyse des fraudes | `/fraud-analysis` | KPIs fraude, graphiques comparatifs fraude/légitime, top 10 transactions frauduleuses |
| Monitoring | `/monitoring` | État MongoDB, compteur documents, temps de réponse, auto-refresh 10 s |

---

## Évolutions possibles

- **Kafka** — Ingestion de transactions en temps réel via un topic dédié.
- **Apache Spark** — Traitement batch et calcul de statistiques sur grands volumes.
- **Modèle ML** — Intégration d'un scoring de risque via une API Python (Scikit-learn / XGBoost).
- **Authentification JWT** — Remplacement de la configuration Spring Security actuelle par des tokens JWT.
- **Redis** — Cache des agrégations MongoDB pour accélérer les requêtes répétées sur le dashboard.
- **Profil Spring `prod`** — Séparation de la configuration de développement et de production.

---

## Notes importantes

- `isFraud` est un **label historique** du dataset d'entraînement IEEE-CIS, pas une prédiction en temps réel.
- Les labels du **jeu de test** ne sont pas disponibles dans le dataset public.
- Les agrégations MongoDB (statistiques, tendances) sont exécutées **côté serveur** — aucune donnée brute n'est chargée en mémoire pour effectuer les calculs.
- La pagination et les filtres sont appliqués dans MongoDB via `MongoTemplate`, pas dans React.
- Les index MongoDB sont créés automatiquement au démarrage via `MongoConfig`.

---

## Développement

Projet universitaire — **deux développeuses** :

| Rôle | Responsabilité |
|------|----------------|
| Développeuse 1 | Préparation, nettoyage, importation et stockage des données dans MongoDB |
| Développeuse 2 | Développement de l'application web (backend Spring Boot + frontend React) |

Dataset source : [IEEE-CIS Fraud Detection — Kaggle](https://www.kaggle.com/c/ieee-fraud-detection)
