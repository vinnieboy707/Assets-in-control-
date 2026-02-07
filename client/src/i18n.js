import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Header
      "app.title": "Assets in Control",
      "app.subtitle": "Manage all your cryptocurrency wallets and staked assets in one awesome place ✨",
      
      // Navigation
      "nav.wallets": "💰 Wallets",
      "nav.staking": "🏦 Staking",
      "nav.airdrops": "🎁 Airdrops",
      "nav.transactions": "💸 Transactions",
      
      // Wallets
      "wallets.title": "💼 Your Wallets",
      "wallets.addNew": "+ Add New Wallet 🚀",
      "wallets.address": "Address",
      "wallets.balance": "Balance",
      "wallets.type": "Type",
      "wallets.verified": "Verified",
      "wallets.actions": "Actions",
      
      // Staking
      "staking.title": "Staking Dashboard",
      "staking.totalStaked": "Total Staked Value",
      "staking.activeStakes": "Active Stakes",
      "staking.cryptocurrencies": "Cryptocurrencies",
      "staking.unstake": "Unstake",
      "staking.apy": "APY",
      
      // Transactions
      "transactions.title": "Transactions",
      "transactions.stake": "Stake Assets",
      "transactions.withdraw": "Withdraw",
      "transactions.trade": "Trade for Cash",
      "transactions.deposit": "Deposit",
      "transactions.type": "Type",
      "transactions.amount": "Amount",
      "transactions.status": "Status",
      "transactions.date": "Date",
      "transactions.export": "Export",
      
      // Auth
      "auth.login": "Login",
      "auth.register": "Register",
      "auth.logout": "Logout",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.name": "Name",
      "auth.forgotPassword": "Forgot Password?",
      
      // Common
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.search": "Search",
      "common.filter": "Filter",
      
      // Price
      "price.current": "Current Price",
      "price.change24h": "24h Change",
      "price.marketCap": "Market Cap",
      "price.volume": "Volume",
      
      // Export
      "export.csv": "Export as CSV",
      "export.json": "Export as JSON",
      "export.all": "Export All Data"
    }
  },
  es: {
    translation: {
      // Header
      "app.title": "Activos bajo Control",
      "app.subtitle": "Gestiona todas tus billeteras de criptomonedas y activos apostados en un solo lugar increíble ✨",
      
      // Navigation
      "nav.wallets": "💰 Billeteras",
      "nav.staking": "🏦 Staking",
      "nav.airdrops": "🎁 Airdrops",
      "nav.transactions": "💸 Transacciones",
      
      // Wallets
      "wallets.title": "💼 Tus Billeteras",
      "wallets.addNew": "+ Agregar Nueva Billetera 🚀",
      "wallets.address": "Dirección",
      "wallets.balance": "Saldo",
      "wallets.type": "Tipo",
      "wallets.verified": "Verificado",
      "wallets.actions": "Acciones",
      
      // Staking
      "staking.title": "Panel de Staking",
      "staking.totalStaked": "Valor Total en Staking",
      "staking.activeStakes": "Stakes Activos",
      "staking.cryptocurrencies": "Criptomonedas",
      "staking.unstake": "Desbloquear",
      "staking.apy": "TAE",
      
      // Transactions
      "transactions.title": "Transacciones",
      "transactions.stake": "Apostar Activos",
      "transactions.withdraw": "Retirar",
      "transactions.trade": "Intercambiar por Efectivo",
      "transactions.deposit": "Depositar",
      "transactions.type": "Tipo",
      "transactions.amount": "Cantidad",
      "transactions.status": "Estado",
      "transactions.date": "Fecha",
      "transactions.export": "Exportar",
      
      // Auth
      "auth.login": "Iniciar Sesión",
      "auth.register": "Registrarse",
      "auth.logout": "Cerrar Sesión",
      "auth.email": "Correo Electrónico",
      "auth.password": "Contraseña",
      "auth.name": "Nombre",
      "auth.forgotPassword": "¿Olvidaste tu contraseña?",
      
      // Common
      "common.save": "Guardar",
      "common.cancel": "Cancelar",
      "common.delete": "Eliminar",
      "common.edit": "Editar",
      "common.loading": "Cargando...",
      "common.error": "Error",
      "common.success": "Éxito",
      "common.search": "Buscar",
      "common.filter": "Filtrar",
      
      // Price
      "price.current": "Precio Actual",
      "price.change24h": "Cambio 24h",
      "price.marketCap": "Cap. de Mercado",
      "price.volume": "Volumen",
      
      // Export
      "export.csv": "Exportar como CSV",
      "export.json": "Exportar como JSON",
      "export.all": "Exportar Todos los Datos"
    }
  },
  fr: {
    translation: {
      // Header
      "app.title": "Actifs sous Contrôle",
      "app.subtitle": "Gérez tous vos portefeuilles de crypto-monnaies et actifs mis en jeu en un seul endroit génial ✨",
      
      // Navigation
      "nav.wallets": "💰 Portefeuilles",
      "nav.staking": "🏦 Staking",
      "nav.airdrops": "🎁 Airdrops",
      "nav.transactions": "💸 Transactions",
      
      // Wallets
      "wallets.title": "💼 Vos Portefeuilles",
      "wallets.addNew": "+ Ajouter un Nouveau Portefeuille 🚀",
      "wallets.address": "Adresse",
      "wallets.balance": "Solde",
      "wallets.type": "Type",
      "wallets.verified": "Vérifié",
      "wallets.actions": "Actions",
      
      // Staking
      "staking.title": "Tableau de Bord Staking",
      "staking.totalStaked": "Valeur Totale Mise en Jeu",
      "staking.activeStakes": "Stakes Actifs",
      "staking.cryptocurrencies": "Crypto-monnaies",
      "staking.unstake": "Débloquer",
      "staking.apy": "TAP",
      
      // Transactions
      "transactions.title": "Transactions",
      "transactions.stake": "Miser des Actifs",
      "transactions.withdraw": "Retirer",
      "transactions.trade": "Échanger contre de l'Argent",
      "transactions.deposit": "Déposer",
      "transactions.type": "Type",
      "transactions.amount": "Montant",
      "transactions.status": "Statut",
      "transactions.date": "Date",
      "transactions.export": "Exporter",
      
      // Auth
      "auth.login": "Se Connecter",
      "auth.register": "S'inscrire",
      "auth.logout": "Se Déconnecter",
      "auth.email": "Email",
      "auth.password": "Mot de Passe",
      "auth.name": "Nom",
      "auth.forgotPassword": "Mot de passe oublié?",
      
      // Common
      "common.save": "Enregistrer",
      "common.cancel": "Annuler",
      "common.delete": "Supprimer",
      "common.edit": "Modifier",
      "common.loading": "Chargement...",
      "common.error": "Erreur",
      "common.success": "Succès",
      "common.search": "Rechercher",
      "common.filter": "Filtrer",
      
      // Price
      "price.current": "Prix Actuel",
      "price.change24h": "Changement 24h",
      "price.marketCap": "Cap. Boursière",
      "price.volume": "Volume",
      
      // Export
      "export.csv": "Exporter en CSV",
      "export.json": "Exporter en JSON",
      "export.all": "Exporter Toutes les Données"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
