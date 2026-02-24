
import React, { useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

// Extend Window interface for global functions/variables used in HTML onclicks
declare global {
  interface Window {
    navigateTo: any;
    toggleMenu: any;
    promptForPassword: any;
    hidePasswordPrompt: any;
    checkPassword: any;
    showBlocDetails: any;
    goBack: any;
    showSubBlocDetails: any;
    showRoomProfiles: any;
    showRoomDetails: any;
    showRoomContents: any;
    showCategoryList: any;
    saveRoom: any;
    previewRoomPhoto: any;
    previewRoomPlan: any;
    viewRoomPlan: any;
    previewMaterielPhoto: any;
    removeMaterielPhoto: any;
    saveMateriel: any;
    editMateriel: any;
    deleteMateriel: any;
    showAddMaterielForm: any;
    saveCategory: any;
    sendAubeMessage: any;
    saveAubeKb: any;
    createNewNote: any;
    deleteCurrentNote: any;
    saveCurrentNote: any;
    deleteNoteFromList: any;
    openNoteEditor: any;
    deleteAlert: any;
    loadAndShowPdf: any;
    currentSalleId: any;
    marked: any;
    lucide: any;
    loadData: any;
    saveData: any;
    initializeApp: any;
    loadNotesList: any;
    startRoomLongPress: any;
    endRoomLongPress: any;
    deleteRoom: any;
  }
}

export default function App() {
  useEffect(() => {
    const runOriginalScript = () => {
        // --- CORE VARIABLES ---
        let menuContainer = document.getElementById('menu-container');
        let overlay = document.getElementById('menu-overlay');
        let currentScreen = 'screen-blocA';
        let navigationHistory = ['screen-blocA']; 
        
        let currentBlocId: any = null;
        let currentSubBlocId: any = null;
        let currentNiveau: any = null;
        window.currentSalleId = null;
        let currentCategorie: any = null;
        
        let currentMaterielPhoto: any = null; 
        let currentRoomPhoto: any = null; 
        let currentRoomPlan: any = null;
        let currentNoteId: any = null; 
        let currentEditingMaterielId: any = null; 
        
        let longPressTimer: any = null;
    
        // --- DATA STORE ---
        let appData: any = {};
        const defaultData = {
            general: {
                mainBuildingImage: 'https://placehold.co/400x220/3b82f6/ffffff?text=Universit%C3%A9',
                mainBgUrl: null,
                appIconUrl: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚚</text></svg>',
                menuBgUrl: 'https://placehold.co/420x900/1e3a8a/ffffff?text=Arri%C3%A8re-plan',
                menuLogoUrl: 'https://placehold.co/80x80/ffffff/7f1d1d?text=Logo'
            },
            blocs: {
                A: {
                    mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+A',
                    subBlocs: [
                        { id: 'A1', title: 'A1', imageTitle: '· Salles de classe ·', image: 'https://placehold.co/400x220/3b82f6/ffffff?text=Salles+A1' },
                        { id: 'A2', title: 'A2', imageTitle: '· Bureaux ·', image: 'https://placehold.co/400x220/3b82f6/ffffff?text=Bureaux+A2' }
                    ]
                },
                B: {
                    mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+B',
                    subBlocs: [
                        { id: 'B1', title: 'B1', imageTitle: '· Salles de classe ·', image: 'https://placehold.co/400x220/16a34a/ffffff?text=Salles+B1' },
                        { id: 'B2', title: 'B2', imageTitle: '· Bureaux ·', image: 'https://placehold.co/400x220/16a34a/ffffff?text=Bureaux+B2' }
                    ]
                },
                C: { 
                    mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+C', 
                    subBlocs: [
                        { id: 'C1', title: 'C1', imageTitle: '· Salles de classe ·', image: 'https://placehold.co/400x220/f59e0b/ffffff?text=Salles+C1' },
                        { id: 'C2', title: 'C2', imageTitle: '· Bureaux ·', image: 'https://placehold.co/400x220/f59e0b/ffffff?text=Bureaux+C2' }
                    ] 
                },
                D: { 
                    mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+D', 
                    subBlocs: [
                        { id: 'D1', title: 'Box Sécurité', imageTitle: '· Box Sécurité ·', image: 'https://placehold.co/400x220/c026d3/ffffff?text=Box+D1' },
                        { id: 'D2', title: 'Parking', imageTitle: '· Parking ·', image: 'https://placehold.co/400x220/64748b/ffffff?text=Parking+D2' }
                    ] 
                },
                E: { 
                    mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+E', 
                    subBlocs: [
                        { id: 'E1', title: 'Toilettes', imageTitle: '· Toilettes ·', image: 'https://placehold.co/400x220/ea580c/ffffff?text=Toilettes+E1' },
                        { id: 'E2', title: 'Jardins', imageTitle: '· Jardins ·', image: 'https://placehold.co/400x220/22c55e/ffffff?text=Jardins+E2' }
                    ] 
                },
                F: { mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+F', subBlocs: [] }
            },
            salles: [], 
            defaultCategories: [
                "Ampoules", "Armoires", "Balais", "Baies de brassage", "Bouilloires", "Bureaux", "Câbles", "Cafetières", "Canapés", "Chaises", "Claviers", "Climatiseurs", "Coussins", "Disques durs", "Extincteurs", "Fauteuils", "Horloges", "Imprimantes", "Lampes", "Micro-ondes", "Multiprises", "Ordinateurs", "Papier", "Photocopieurs", "Plantes", "Post-it", "Poubelles", "Prises", "Produits", "Rallonges", "Rideaux", "Routeurs", "Réfrigérateurs", "Scanners", "Serpillères", "Savon", "Souris", "Tables", "Tableaux", "Tapis", "Téléphones", "Vaisselle", "Ventilateurs", "Vidéoprojecteurs", "Écrans", "Étagères"
            ],
            customCategories: [],
            materiel: [], 
            notes: [], 
            alerts: [], 
            aube: { kb: "Je suis Aube, l'assistant logistique.", hasNewNotification: false }
        };

        // --- DATABASE HELPERS ---
        const DB_NAME = 'LogisticsAppDB';
        const STORE_NAME = 'files';

        function openDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (event: any) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME);
                    }
                };
            });
        }

        async function saveFileToDB(id: string, dataUrl: string) {
            try {
                const db: any = await openDB();
                return new Promise<void>((resolve, reject) => {
                    const transaction = db.transaction([STORE_NAME], 'readwrite');
                    const store = transaction.objectStore(STORE_NAME);
                    const request = store.put(dataUrl, id);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            } catch (e) { console.error(e); }
        }

        async function loadFileFromDB(id: string): Promise<string | null> {
            try {
                const db: any = await openDB();
                return new Promise((resolve, reject) => {
                    const transaction = db.transaction([STORE_NAME], 'readonly');
                    const store = transaction.objectStore(STORE_NAME);
                    const request = store.get(id);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            } catch (e) { console.error(e); return null; }
        }

        async function deleteFileFromDB(id: string) {
            try {
                const db: any = await openDB();
                return new Promise<void>((resolve, reject) => {
                    const transaction = db.transaction([STORE_NAME], 'readwrite');
                    const store = transaction.objectStore(STORE_NAME);
                    const request = store.delete(id);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            } catch (e) { console.error(e); }
        }

        async function loadAndSetImage(imgId: string, fileId: string, placeholder: string) {
            const imgEl = document.getElementById(imgId) as HTMLImageElement;
            if (!imgEl) return;
            try {
                const data = await loadFileFromDB(fileId);
                imgEl.src = data || placeholder;
            } catch { imgEl.src = placeholder; }
        }

        function checkMaterielExpiration() {
            const today = new Date();
            const upcoming = new Date();
            upcoming.setDate(today.getDate() + 30);
            let newAlerts: any[] = [];
            
            appData.materiel.forEach((item: any) => {
                if (item.dateRen) {
                    const renDate = new Date(item.dateRen);
                    if (renDate <= upcoming) {
                         const exists = appData.alerts.find((a: any) => a.materielId === item.id && a.type === 'expiration');
                         if (!exists) {
                             newAlerts.push({
                                 id: `alert-${new Date().getTime()}-${item.id}`,
                                 materielId: item.id,
                                 type: 'expiration',
                                 message: `Renouvellement: "${item.nom}"`,
                                 date: new Date().toISOString(),
                                 read: false
                             });
                         }
                    }
                }
            });
            if (newAlerts.length > 0) {
                appData.alerts = [...newAlerts, ...appData.alerts];
                window.saveData();
                updateNotificationDot();
            }
        }

        window.deleteAlert = function(alertId: string) {
            appData.alerts = appData.alerts.filter((a: any) => a.id !== alertId);
            window.saveData();
            loadAlerts();
            updateNotificationDot();
        }

        function loadAlerts() {
             const container = document.getElementById('alerts-list-container');
             if(!container) return;
             container.innerHTML = '';
             if (appData.alerts.length === 0) {
                 container.innerHTML = `<div class="p-8 text-center text-gray-500">Aucune alerte.</div>`;
                 return;
             }
             appData.alerts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
             appData.alerts.forEach((alert: any) => {
                 container.innerHTML += `
                    <div class="bg-white p-4 rounded-lg shadow border-l-4 ${alert.read ? 'border-gray-300 opacity-75' : 'border-red-500'} mb-3 flex justify-between items-start">
                        <div>
                            <p class="font-bold text-gray-800">${alert.type === 'expiration' ? '⚠️ Attention' : 'Info'}</p>
                            <p class="text-sm text-gray-600 mt-1">${alert.message}</p>
                            <p class="text-xs text-gray-400 mt-2">${new Date(alert.date).toLocaleDateString()}</p>
                        </div>
                        <button onclick="window.deleteAlert('${alert.id}')" class="text-gray-400 hover:text-red-500"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>`;
             });
             const hasUnread = appData.alerts.some((a: any) => !a.read);
             if (hasUnread) {
                 appData.alerts.forEach((a: any) => a.read = true);
                 window.saveData();
                 updateNotificationDot();
             }
             if(window.lucide) window.lucide.createIcons();
        }

        // --- PERSISTENCE ---
        window.saveData = function() {
            try { localStorage.setItem('logisticsAppData', JSON.stringify(appData)); } catch (e) { console.error(e); }
        }
    
        window.loadData = function() {
            try {
                const savedData = localStorage.getItem('logisticsAppData');
                if (savedData) {
                    appData = JSON.parse(savedData);
                    appData.general = {...defaultData.general, ...appData.general};
                    appData.blocs = {...defaultData.blocs, ...appData.blocs};
                    appData.salles = Array.isArray(appData.salles) ? appData.salles : [];
                    appData.materiel = appData.materiel || defaultData.materiel;
                    appData.notes = Array.isArray(appData.notes) ? appData.notes : [];
                    appData.alerts = appData.alerts || defaultData.alerts; 
                    appData.aube = {...defaultData.aube, ...appData.aube};
                } else {
                    appData = JSON.parse(JSON.stringify(defaultData)); 
                }
                applyVisualData();
                updateNotificationDot();
                window.loadNotesList();
                checkMaterielExpiration();
            } catch(e) { appData = JSON.parse(JSON.stringify(defaultData)); }
        }

        function applyVisualData() {
            const mainImg = document.getElementById('main-building-image');
            if(mainImg) (mainImg as any).src = appData.general.mainBuildingImage;
            const container = document.getElementById('main-app-container');
            if (container && appData.general.mainBgUrl) {
                container.style.backgroundImage = `url(${appData.general.mainBgUrl})`;
                container.style.backgroundSize = 'cover';
            }
            const aubeKb = document.getElementById('aube-kb');
            if(aubeKb) (aubeKb as any).value = appData.aube.kb;
        }
        
        function updateBottomNav(screenId: string) {
            const bottomNav = document.getElementById('bottom-nav-bar');
            if(bottomNav) {
                if (['screen-blocA', 'screen-notes', 'screen-alerts'].includes(screenId)) {
                    bottomNav.classList.remove('hidden');
                } else {
                    bottomNav.classList.add('hidden');
                }
            }
            document.getElementById('nav-home-btn')?.classList.toggle('opacity-70', screenId !== 'screen-blocA');
            document.getElementById('nav-notes-btn')?.classList.toggle('opacity-70', screenId !== 'screen-notes');
        }
        
        function updateNotificationDot() {
            const dot = document.getElementById('notification-dot');
            if(!dot) return;
            const hasUnreadAlerts = appData.alerts.some((a: any) => !a.read);
            dot.classList.toggle('hidden', !hasUnreadAlerts);
        }

        // --- NAVIGATION ---
        window.navigateTo = function(screenId: string) {
            if (screenId === currentScreen) return; 
            document.getElementById(currentScreen)?.classList.add('hidden');
            document.getElementById(currentScreen)?.classList.remove('flex');
            
            const newEl = document.getElementById(screenId);
            if(newEl) {
                newEl.classList.remove('hidden');
                newEl.classList.add('flex');
            }
            
            if (['screen-blocA', 'screen-notes', 'screen-alerts'].includes(screenId)) {
                 navigationHistory = [screenId];
            } else {
                 navigationHistory.push(screenId);
            }
            currentScreen = screenId;
            
            updateBottomNav(screenId);
    
            if (screenId === 'screen-alerts') loadAlerts(); 
            if (screenId === 'screen-notes') window.loadNotesList();
            if(menuContainer && !menuContainer.classList.contains('-translate-x-full')) window.toggleMenu();
        }
        
        window.goBack = function() {
            if (navigationHistory.length <= 1) return; 
            const oldScreen = navigationHistory.pop();
            let newScreen = navigationHistory[navigationHistory.length - 1];
            
            // SMART RETURN LOGIC
            if (oldScreen === 'screen-sous-sol') {
                newScreen = ['D1', 'D2', 'E2'].includes(currentSubBlocId) ? 'screen-blocA-details' : 'screen-blocA1-levels';
            }
            if (oldScreen === 'screen-room-details') newScreen = 'screen-sous-sol';
            if (oldScreen === 'screen-room-contents') newScreen = 'screen-room-details';
            
            document.getElementById(oldScreen!)?.classList.add('hidden');
            document.getElementById(oldScreen!)?.classList.remove('flex');
            document.getElementById(newScreen)?.classList.remove('hidden');
            document.getElementById(newScreen)?.classList.add('flex');
            
            currentScreen = newScreen!;
            updateBottomNav(newScreen!);
            
            // REFRESH STATE
            if (newScreen === 'screen-sous-sol') window.showRoomProfiles(currentNiveau, 'Profils des salles', false);
            if (newScreen === 'screen-notes') window.loadNotesList();
            if (newScreen === 'screen-categories') window.showCategoryList(window.currentSalleId, false); 
            if (newScreen === 'screen-room-details') window.showRoomDetails(window.currentSalleId, false); 
            if (newScreen === 'screen-room-contents') window.showRoomContents(window.currentSalleId, false); 
        }
    
        // --- BLOC LOGIC ---
        window.showBlocDetails = function(blocId: string) {
            currentBlocId = blocId;
            const blocData = appData.blocs[blocId];
            document.getElementById('bloc-details-title')!.innerText = `Bloc ${blocId}`;
            (document.getElementById('bloc-details-main-image') as any).src = blocData.mainImage;
            document.getElementById('bloc-details-main-image-title')!.innerText = `· Bloc ${blocId} vu de dessus ·`;
    
            [0, 1].forEach(idx => {
                const sub = blocData.subBlocs[idx];
                const elTitle = document.getElementById(`sub-bloc-title-${idx+1}`);
                const elImg = document.getElementById(`sub-bloc-image-${idx+1}`);
                const elTxt = document.getElementById(`sub-bloc-image-title-${idx+1}`);
                
                if (sub) {
                    if(elTitle) elTitle.innerText = sub.title;
                    if(elImg) {
                        (elImg as any).src = sub.image;
                        elImg.onclick = () => window.showSubBlocDetails(sub.id);
                    }
                    if(elTxt) elTxt.innerText = sub.imageTitle;
                    elTitle?.classList.remove('hidden');
                    elImg?.parentElement?.classList.remove('hidden');
                } else {
                    elTitle?.classList.add('hidden');
                    elImg?.parentElement?.classList.add('hidden');
                }
            });
            window.navigateTo('screen-blocA-details');
        }
    
        window.showSubBlocDetails = function(subBlocId: string) {
            currentSubBlocId = subBlocId;
            document.getElementById('levels-title')!.innerText = `Bloc ${subBlocId}`;
            if (subBlocId === 'D1') window.showRoomProfiles('Box Sécurité', 'Profil');
            else if (subBlocId === 'D2') window.showRoomProfiles('Parking', 'Profil');
            else if (subBlocId === 'E2') window.showRoomProfiles('Jardins', 'Profil');
            else window.navigateTo('screen-blocA1-levels');
        }
    
        window.showRoomProfiles = function(niveau: string, title = 'Profils des salles', navigate = true) {
            currentNiveau = niveau || currentNiveau;
            if(!currentNiveau) return;
            document.getElementById('room-profiles-title')!.innerText = currentNiveau;
            document.getElementById('room-profiles-header')!.innerText = title;
    
            const container = document.getElementById('room-profiles-container');
            if(container) {
                container.innerHTML = '';
                const filtered = appData.salles.filter((s: any) => 
                    (s.emplacement || "").toUpperCase().trim() === (currentSubBlocId || "").toUpperCase().trim() && 
                    (s.niveau || "").trim() === (currentNiveau || "").trim()
                );
                
                if (filtered.length === 0) {
                    container.innerHTML = `<div class="w-full text-center py-4 text-gray-500 italic">Aucune salle.</div>`;
                } else {
                    filtered.forEach((salle: any) => {
                        const imgId = `salle-img-${salle.id}`;
                        container.innerHTML += `
                            <div 
                                onmousedown="window.startRoomLongPress('${salle.id}')" 
                                onmouseup="window.endRoomLongPress()" 
                                ontouchstart="window.startRoomLongPress('${salle.id}')" 
                                ontouchend="window.endRoomLongPress()"
                                onclick="window.showRoomDetails('${salle.id}')" 
                                oncontextmenu="return false;"
                                class="flex-shrink-0 text-center w-24 cursor-pointer select-none">
                                <img src="https://placehold.co/96x96/b91c1c/ffffff?text=${salle.nom.charAt(0)}" id="${imgId}" class="w-24 h-24 bg-red-700 rounded-2xl shadow-md object-cover pointer-events-none">
                                <p class="mt-2 text-sm font-semibold text-gray-700 break-words">${salle.nom}</p>
                            </div>`;
                        if (salle.photoId) loadAndSetImage(imgId, salle.photoId, '');
                    });
                }
            }
            if (navigate) window.navigateTo('screen-sous-sol');
        }
        
        window.startRoomLongPress = function(salleId: string) {
            longPressTimer = setTimeout(() => window.deleteRoom(salleId), 800);
        }
        window.endRoomLongPress = function() {
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
        }
        window.deleteRoom = async function(salleId: string) {
             if (longPressTimer) clearTimeout(longPressTimer);
             if(confirm("Supprimer cette salle et tout son contenu ?")) {
                 const salle = appData.salles.find((s: any) => s.id === salleId);
                 if (salle) {
                     if (salle.photoId) await deleteFileFromDB(salle.photoId);
                     if (salle.plan3dId) await deleteFileFromDB(salle.plan3dId);
                     appData.materiel = appData.materiel.filter((m: any) => m.salleId !== salleId);
                     appData.salles = appData.salles.filter((s: any) => s.id !== salleId);
                     window.saveData();
                     window.showRoomProfiles(currentNiveau, 'Profils des salles', false);
                 }
             }
        }
        
        window.showRoomDetails = function(salleId: string, navigate = true) {
            window.currentSalleId = salleId;
            const salle = appData.salles.find((s: any) => s.id === salleId);
            if (!salle) return;
            
            document.getElementById('room-details-title')!.innerText = salle.nom;
            document.getElementById('room-details-header')!.innerText = `Détails de ${salle.nom}`;
            
            const container = document.getElementById('room-details-info-container');
            if (container) {
                let html = '';
                if (salle.capacity) html += `<div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg"><span class="font-bold text-gray-700">Capacité:</span> <span class="font-medium text-gray-600">${salle.capacity}</span></div>`;
                if (salle.area) html += `<div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg"><span class="font-bold text-gray-700">Superficie:</span> <span class="font-medium text-gray-600">${salle.area}</span></div>`;
                
                html += `<div class="mt-4 bg-gray-100 rounded-xl h-48 flex flex-col items-center justify-center border border-gray-200 relative overflow-hidden shadow-inner">
                            <p class="absolute top-2 left-2 text-xs font-bold text-gray-500">Plan 3D / Architecture</p>`;
                if (salle.plan3dId) {
                    html += `<div onclick="window.viewRoomPlan('${salle.plan3dId}')" class="cursor-pointer text-center flex flex-col items-center text-blue-600">
                                <i data-lucide="box" class="w-12 h-12 mb-2"></i>
                                <span class="text-sm font-semibold">Voir le plan</span>
                             </div>`;
                } else {
                    html += `<p class="text-gray-400 font-medium">Aucun plan</p>`;
                }
                html += `</div>`;
                container.innerHTML = html;
                if(window.lucide) window.lucide.createIcons();
            }
            if (navigate) window.navigateTo('screen-room-details');
        }
        
        window.viewRoomPlan = function(planId: string) {
            window.loadAndShowPdf(planId, 'screen-guide', 'guide-pdf-viewer', 'guide-pdf-placeholder');
            document.querySelector('#screen-guide h1')!.innerHTML = "Plan 3D";
        }
        
        window.loadAndShowPdf = async function(fileId: string, screenId: string, viewerId: string, placeholderId: string) {
            window.navigateTo(screenId);
            const viewer = document.getElementById(viewerId);
            if (viewer) viewer.innerHTML = 'Chargement...';
            try {
                const dataUrl = await loadFileFromDB(fileId);
                if (dataUrl && viewer) {
                     viewer.innerHTML = `<div class="flex flex-col items-center justify-center h-full p-5 text-center"><a href="${dataUrl}" download="fichier" class="bg-blue-600 text-white px-6 py-3 rounded-lg shadow font-bold">Télécharger le fichier</a></div>`;
                } else if(viewer) viewer.innerHTML = 'Fichier non trouvé.';
            } catch(e) { if(viewer) viewer.innerHTML = 'Erreur.'; }
        }

        window.previewRoomPhoto = function(event: any) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                currentRoomPhoto = e.target?.result; 
                (document.getElementById('room-photo-preview') as any).src = currentRoomPhoto;
                document.getElementById('room-photo-preview')?.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
        
        window.previewRoomPlan = function(event: any) {
             const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                currentRoomPlan = e.target?.result; 
                document.getElementById('room-plan-label')!.innerText = "Fichier prêt: " + file.name;
                document.getElementById('room-plan-icon')!.classList.add('text-green-500');
            };
            reader.readAsDataURL(file);
        }

        window.saveRoom = async function() {
            const nom = (document.getElementById('add-room-nom') as any).value.trim();
            const emplacement = (document.getElementById('add-room-emplacement') as any).value.trim().toUpperCase();
            const niveau = (document.getElementById('add-room-niveau') as any).value.trim();
            
            if (!nom || !emplacement || !niveau) {
                alert("Nom, Emplacement et Niveau sont obligatoires.");
                return;
            }
            
            const newSalle: any = {
                id: `salle-${new Date().getTime()}`,
                nom, emplacement, niveau,
                capacity: (document.getElementById('add-room-capacity') as any).value.trim(),
                area: (document.getElementById('add-room-area') as any).value.trim(),
                photoId: null, plan3dId: null
            };
            if (currentRoomPhoto) {
                newSalle.photoId = `img-salle-${new Date().getTime()}`;
                await saveFileToDB(newSalle.photoId, currentRoomPhoto);
            }
            if (currentRoomPlan) {
                 newSalle.plan3dId = `file-plan-${new Date().getTime()}`;
                 await saveFileToDB(newSalle.plan3dId, currentRoomPlan);
            }
            appData.salles.push(newSalle);
            window.saveData();
            
            // Clean up
            (document.getElementById('add-room-nom') as any).value = '';
            document.getElementById('room-photo-preview')?.classList.add('hidden');
            currentRoomPhoto = null; currentRoomPlan = null;
            
            // Update Context & Return
            currentSubBlocId = newSalle.emplacement;
            currentNiveau = newSalle.niveau;
            window.goBack(); // This triggers the refresh on the profiles screen
        }

        // --- NOTES LOGIC ---
        window.loadNotesList = function() {
            const container = document.getElementById('notes-list-container');
            if (!container) return;
            container.innerHTML = ''; 
            const query = (document.getElementById('note-search-input') as any)?.value.toLowerCase() || '';
            const filtered = (appData.notes || []).filter((n: any) => (n.title+n.content).toLowerCase().includes(query));
            
            if (filtered.length === 0) {
                container.innerHTML = `<p class="text-center text-gray-500 mt-10">Aucune note.</p>`;
            } else {
                filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach((note: any) => {
                    container.innerHTML += `
                        <div class="bg-white p-4 rounded-xl shadow mb-3 border-l-4 border-yellow-400 cursor-pointer hover:shadow-md transition-shadow" onclick="window.openNoteEditor('${note.id}')">
                            <h4 class="font-bold text-gray-800 truncate">${note.title || 'Sans titre'}</h4>
                            <p class="text-xs text-gray-500 mt-1">${new Date(note.date).toLocaleDateString()}</p>
                        </div>`;
                });
            }
        }
        window.createNewNote = function() {
            currentNoteId = null; 
            (document.getElementById('note-editor-title') as any).value = '';
            (document.getElementById('note-editor-content') as any).value = '';
            window.navigateTo('screen-note-editor');
        }
        window.openNoteEditor = function(noteId: string) {
            const note = appData.notes.find((n: any) => n.id === noteId);
            if (!note) return;
            currentNoteId = noteId;
            (document.getElementById('note-editor-title') as any).value = note.title;
            (document.getElementById('note-editor-content') as any).value = note.content;
            window.navigateTo('screen-note-editor');
        }
        window.saveCurrentNote = function() {
            const title = (document.getElementById('note-editor-title') as any).value;
            const content = (document.getElementById('note-editor-content') as any).value;
            if(!title.trim() && !content.trim()) { window.goBack(); return; }
            
            if (currentNoteId) {
                const note = appData.notes.find((n: any) => n.id === currentNoteId);
                if(note) { note.title = title; note.content = content; note.date = new Date().toISOString(); }
            } else {
                appData.notes.push({
                    id: `note-${new Date().getTime()}`,
                    title, content, date: new Date().toISOString()
                });
            }
            window.saveData();
            window.goBack(); 
        }
        window.deleteCurrentNote = function() {
            if(currentNoteId && confirm("Supprimer ?")) {
                appData.notes = appData.notes.filter((n: any) => n.id !== currentNoteId);
                window.saveData();
            }
            window.goBack(); 
        }

        window.toggleMenu = function() {
            menuContainer?.classList.toggle('-translate-x-full');
            overlay?.classList.toggle('hidden');
        }

        window.initializeApp = function() {
             window.loadData();
             window.navigateTo('screen-blocA');
             if(window.lucide) window.lucide.createIcons();
        }

        window.initializeApp();
    }
    
    runOriginalScript();
  }, []);

  return (
    <div id="main-app-container" className="main-container relative min-h-screen flex flex-col bg-[#fde7f3] bg-center shadow-2xl overflow-hidden max-w-[420px] mx-auto font-sans text-gray-800">
      
      {/* HOME */}
      <div id="screen-blocA" className="flex flex-col h-full w-full absolute inset-0 bg-transparent">
        <div className="flex-shrink-0 px-4 pt-4 z-10">
          <div className="bg-[#b91c1c] text-white rounded-full flex justify-between items-center p-3 shadow-md">
            <button onClick={() => window.toggleMenu()} className="text-white"><i data-lucide="menu"></i></button>
            <h1 className="font-semibold text-sm">&nbsp;</h1>
            <button onClick={() => window.navigateTo('screen-settings')} className="text-white"><i data-lucide="sliders-horizontal"></i></button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto px-4 pb-24">
          <div className="relative my-4">
            <input type="search" placeholder="Rechercher..." className="w-full bg-white rounded-full pl-10 pr-12 py-2 border border-gray-200 shadow-sm" />
            <i data-lucide="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"></i>
            <button onClick={() => window.navigateTo('screen-settings')} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600"><i data-lucide="bot"></i></button>
          </div>
          <div className="bg-[#1e3a8a] rounded-2xl p-2 flex items-center space-x-2 overflow-x-auto no-scrollbar mb-4 shadow-lg">
            {['A', 'B', 'C', 'D', 'E', 'F'].map(bloc => (
                <button key={bloc} onClick={() => window.showBlocDetails(bloc)} className="text-white py-2 px-4 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-lg flex-shrink-0">Bloc {bloc}</button>
            ))}
          </div>
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-4">
            <img id="main-building-image" src="" className="w-full h-auto object-cover" />
          </div>
          <div className="text-center">
            <div className="bg-[#1e3a8a] text-white inline-block px-6 py-3 rounded-2xl shadow-md font-algerian">UNIVERSITE AUBE NOUVELLE</div>
          </div>
        </div>
      </div>

      {/* BLOC DETAILS */}
      <div id="screen-blocA-details" className="hidden flex-col h-full w-full absolute inset-0 bg-[#fde7f3]">
        <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10 sticky top-0">
          <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
          <div className="w-6"></div>
        </div>
        <div id="bloc-details-title" className="header-btn bg-[#b91c1c] text-white p-3 rounded-full font-bold text-center w-4/5 mx-auto my-4 shadow-md font-algerian"></div>
        <div className="main-content space-y-4 px-4 pb-20 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img id="bloc-details-main-image" className="w-full h-40 object-cover" />
            <p id="bloc-details-main-image-title" className="text-center text-gray-600 text-sm p-2 font-monotype-corsiva"></p>
          </div>
          <p id="sub-bloc-title-1" className="text-center font-algerian text-[#1e3a8a] text-xl"></p>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
             <img id="sub-bloc-image-1" className="w-full h-40 object-cover" />
             <p id="sub-bloc-image-title-1" className="text-center text-gray-600 text-sm p-2 font-monotype-corsiva"></p>
          </div>
          <p id="sub-bloc-title-2" className="text-center font-algerian text-[#1e3a8a] text-xl"></p>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
             <img id="sub-bloc-image-2" className="w-full h-40 object-cover" />
             <p id="sub-bloc-image-title-2" className="text-center text-gray-600 text-sm p-2 font-monotype-corsiva"></p>
          </div>
        </div>
      </div>

      {/* ZOOM IMAGE */}
      <div id="screen-image-zoom" className="hidden flex-col h-full w-full absolute inset-0 bg-black z-50 justify-center items-center">
        <button onClick={() => window.goBack()} className="absolute top-4 left-4 text-white bg-black/50 rounded-full p-2"><i data-lucide="arrow-left"></i></button>
        <img id="zoom-image-src" className="max-w-full max-h-full object-contain" />
      </div>

      {/* LEVELS */}
      <div id="screen-blocA1-levels" className="hidden flex-col h-full w-full absolute inset-0 bg-[#fde7f3]">
         <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
             <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
         </div>
         <div id="levels-title" className="header-btn bg-[#b91c1c] text-white p-3 rounded-full font-bold text-center w-4/5 mx-auto my-4 shadow-md font-algerian"></div>
         <div className="px-4 pb-20 overflow-y-auto space-y-3">
            <div className="bg-white text-[#1e3a8a] font-semibold text-center py-3 rounded-full shadow-md mb-6 font-monotype-corsiva text-lg">· NIVEAUX DE SUBDIVISION ·</div>
            {['Sous-sol', 'Rez-de-chaussée', 'Premier Niveau', 'Deuxième Niveau', 'Troisième Niveau', 'Quatrième Niveau'].map(lvl => (
                <button key={lvl} onClick={() => window.showRoomProfiles(lvl)} className="w-full bg-[#1e3a8a] text-white py-3 rounded-full shadow-md font-monotype-corsiva text-lg">· {lvl} ·</button>
            ))}
         </div>
      </div>

      {/* ROOM PROFILES */}
      <div id="screen-sous-sol" className="hidden flex-col h-full w-full absolute inset-0 bg-[#fde7f3]">
         <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
             <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
         </div>
         <div id="room-profiles-title" className="header-btn bg-[#b91c1c] text-white p-3 rounded-full font-bold text-center w-4/5 mx-auto my-4 shadow-md font-algerian"></div>
         <div className="flex-grow overflow-y-auto px-4 pb-24">
            <h3 id="room-profiles-header" className="text-lg font-monotype-corsiva text-gray-800 font-semibold mb-2">Profils des salles</h3>
            <div id="room-profiles-container" className="flex flex-wrap gap-4"></div>
         </div>
         <button onClick={() => window.navigateTo('screen-addRoom')} className="fixed bottom-24 right-6 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button>
      </div>

      {/* ADD ROOM */}
      <div id="screen-addRoom" className="hidden flex-col h-full w-full absolute inset-0 bg-gray-50 z-20">
        <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
        </div>
        <div className="header-btn bg-[#b91c1c] text-white p-3 rounded-full font-bold text-center w-4/5 mx-auto my-4 shadow-md font-algerian">AJOUTER UNE SALLE</div>
        <div className="flex-grow overflow-y-auto px-4 pb-8 space-y-4">
            <div className="bg-[#1e3a8a] rounded-2xl p-4 flex flex-col items-center justify-center h-40 text-white shadow-lg relative overflow-hidden">
                 <input type="file" id="room-images-upload" accept="image/*" className="absolute inset-0 opacity-0 w-full h-full" onChange={(e) => window.previewRoomPhoto(e)} />
                 <i data-lucide="camera" className="w-10 h-10 mb-2"></i>
                 <p>Photo de la salle</p>
                 <img id="room-photo-preview" className="hidden absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="space-y-3">
                <input id="add-room-nom" type="text" placeholder="Nom" className="w-full p-3 rounded-full border shadow-sm" />
                <input id="add-room-emplacement" type="text" placeholder="Emplacement (ex: Bloc A)" className="w-full p-3 rounded-full border shadow-sm" />
                <input id="add-room-niveau" type="text" placeholder="Niveau" className="w-full p-3 rounded-full border shadow-sm" />
                <div className="flex gap-2">
                    <input id="add-room-capacity" type="number" placeholder="Capacité" className="w-1/2 p-3 rounded-full border shadow-sm" />
                    <input id="add-room-area" type="number" placeholder="Superficie (m²)" className="w-1/2 p-3 rounded-full border shadow-sm" />
                </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-white relative">
                 <input type="file" id="room-plan-upload" accept=".glb,.gltf,.obj,.blend,.bin" className="absolute inset-0 opacity-0 w-full h-full" onChange={(e) => window.previewRoomPlan(e)} />
                 <i id="room-plan-icon" data-lucide="box" className="w-8 h-8 mx-auto text-gray-400"></i>
                 <p id="room-plan-label" className="text-sm mt-1">Ajouter Plan 3D</p>
            </div>
            <button onClick={() => window.saveRoom()} className="w-full bg-[#1e3a8a] text-white font-bold py-3 rounded-full shadow-lg mt-4">Enregistrer</button>
        </div>
      </div>

      {/* ROOM DETAILS */}
      <div id="screen-room-details" className="hidden flex-col h-full w-full absolute inset-0 bg-[#fde7f3]">
         <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
             <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
             <h1 id="room-details-title" className="font-bold text-xl"></h1>
             <div className="w-6"></div>
         </div>
         <div id="room-details-header" className="header-btn bg-[#b91c1c] text-white p-3 rounded-full font-bold text-center w-4/5 mx-auto my-4 shadow-md font-algerian"></div>
         <div className="flex-grow overflow-y-auto px-4 pb-20 flex flex-col items-center">
             <div id="room-details-info-container" className="w-full bg-white p-4 rounded-2xl shadow-md mb-6 space-y-2"></div>
             <button onClick={() => window.showRoomContents(window.currentSalleId)} className="w-4/5 bg-[#1e3a8a] text-white py-3 rounded-full shadow-lg mb-3">Afficher le matériel</button>
             <button onClick={() => window.showCategoryList(window.currentSalleId)} className="w-4/5 bg-[#1e3a8a] text-white py-3 rounded-full shadow-lg">Ajouter du matériel</button>
         </div>
      </div>

      {/* ROOM CONTENTS */}
      <div id="screen-room-contents" className="hidden flex-col h-full w-full absolute inset-0 bg-gray-50">
         <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
             <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
             <h1 id="room-contents-header" className="font-bold text-lg truncate max-w-[200px]"></h1>
             <div className="w-6"></div>
         </div>
         <div id="room-contents-container" className="flex-grow overflow-y-auto p-4 pb-20 space-y-4"></div>
      </div>

      {/* CATEGORIES */}
      <div id="screen-categories" className="hidden flex-col h-full w-full absolute inset-0 bg-gray-50">
         <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
             <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
             <h1 className="font-bold text-xl">CATÉGORIES</h1>
             <div className="w-6"></div>
         </div>
         <div className="p-4 bg-white shadow-sm">
             <input id="category-search-input" type="search" placeholder="Rechercher..." className="w-full bg-gray-100 rounded-full px-4 py-2" onChange={() => window.showCategoryList(window.currentSalleId, false)} />
         </div>
         <div id="category-list-container" className="flex-grow overflow-y-auto p-4 space-y-2"></div>
      </div>

      {/* NOTES */}
      <div id="screen-notes" className="hidden flex-col h-full w-full absolute inset-0 bg-[#fde7f3]">
          <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
              <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
              <h1 className="font-bold text-xl font-algerian">NOTES</h1>
              <button onClick={() => window.createNewNote()} className="text-blue-600"><i data-lucide="plus-circle" className="w-7 h-7"></i></button>
          </div>
          <div className="p-4"><input id="note-search-input" className="w-full p-2 rounded-full border" placeholder="Rechercher..." onChange={() => window.loadNotesList()}/></div>
          <div id="notes-list-container" className="flex-grow overflow-y-auto px-4 pb-24 space-y-4"></div>
      </div>

      {/* NOTE EDITOR */}
      <div id="screen-note-editor" className="hidden flex-col h-full w-full absolute inset-0 bg-white z-20">
          <div className="flex-shrink-0 p-4 flex justify-between items-center border-b">
              <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
              <div className="flex space-x-2">
                  <button onClick={() => window.deleteCurrentNote()} className="text-red-500"><i data-lucide="trash-2"></i></button>
                  <button onClick={() => window.saveCurrentNote()} className="text-blue-600"><i data-lucide="check-circle"></i></button>
              </div>
          </div>
          <div className="flex-grow flex flex-col p-6">
              <input id="note-editor-title" type="text" placeholder="Titre..." className="text-2xl font-bold w-full mb-4 outline-none" />
              <textarea id="note-editor-content" placeholder="Contenu..." className="flex-grow w-full text-lg outline-none resize-none"></textarea>
          </div>
      </div>

      {/* ALERTS */}
      <div id="screen-alerts" className="hidden flex-col h-full w-full absolute inset-0 bg-gray-50">
          <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
              <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
              <h1 className="font-bold text-xl font-algerian">ALERTES</h1>
              <div className="w-6"></div>
          </div>
          <div id="alerts-list-container" className="flex-grow overflow-y-auto p-4 pb-24"></div>
      </div>

      {/* PDF VIEWER */}
      <div id="screen-guide" className="hidden flex-col h-full w-full absolute inset-0 bg-white z-40">
           <div className="flex-shrink-0 p-4 flex justify-between items-center bg-white shadow-sm">
                <button onClick={() => window.goBack()} className="text-gray-600"><i data-lucide="arrow-left"></i></button>
                <h1 className="font-bold text-lg">Visualiseur</h1>
                <div className="w-6"></div>
           </div>
           <div id="guide-pdf-viewer" className="flex-grow flex items-center justify-center p-4"></div>
      </div>

      {/* BOTTOM NAV */}
      <div id="bottom-nav-bar" className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-20">
          <div className="bg-[#1e3a8a] text-white rounded-full flex justify-around items-center h-16 shadow-2xl backdrop-blur-md bg-opacity-95">
              <button onClick={() => window.navigateTo('screen-alerts')} className="p-4 relative"><i data-lucide="bell"></i><span id="notification-dot" className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full hidden"></span></button>
              <button id="nav-home-btn" onClick={() => window.navigateTo('screen-blocA')} className="p-4"><i data-lucide="home"></i></button>
              <button id="nav-notes-btn" onClick={() => window.navigateTo('screen-notes')} className="p-4"><i data-lucide="file-text"></i></button>
          </div>
      </div>

      {/* SIDE MENU */}
      <div id="menu-container" className="fixed inset-0 z-50 transform -translate-x-full transition-transform duration-300 flex">
          <div id="menu-background" className="relative w-80 h-full bg-[#7f1d1d] text-white flex flex-col shadow-2xl p-6">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/20">
                  <h2 className="text-xl font-bold font-algerian">U-AUBEN TRACKER</h2>
                  <button onClick={() => window.toggleMenu()}><i data-lucide="x"></i></button>
              </div>
              <nav className="space-y-4 font-monotype-corsiva text-xl text-center">
                  <a href="#" className="block py-2">· Guide d’utilisation ·</a>
                  <a href="#" className="block py-2">· A propos du développeur ·</a>
                  <a href="#" className="block py-2">· Données ·</a>
              </nav>
          </div>
          <div id="menu-overlay" className="flex-grow bg-black/50 hidden" onClick={() => window.toggleMenu()}></div>
      </div>

    </div>
  );
}
