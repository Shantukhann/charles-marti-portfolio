/* =====================================================================
   Thème (clair / sombre) et langue (français / anglais)
   - Choix mémorisé dans le navigateur ; par défaut : préférences du système / de la langue du navigateur.
   - Pour corriger ou ajouter une traduction : modifier le dictionnaire EN ci-dessous
     (clé = texte français exact, valeur = texte anglais).
   ===================================================================== */
(() => {
    'use strict';
    const root = document.documentElement;
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* navigation privée : on ignore */ }}
    };

    /* ============================ DICTIONNAIRE FR -> EN ============================ */
    const EN = {
        /* navigation */
        'Aller aux expériences': 'Skip to experience',
        'Mon Parcours': 'My Journey',
        'Expériences': 'Experience',
        'Compétences': 'Skills',
        'Réalisations': 'Projects',
        'Par e-mail': 'By email',
        'Sur LinkedIn': 'On LinkedIn',
        'Fiche contact': 'Contact card',
        'Me contacter par e-mail': 'Contact me by email',
        'Mon profil LinkedIn': 'My LinkedIn profile',
        'Télécharger mon CV': 'Download my CV',
        /* hero */
        'Chef de Projet Événementiel': 'Event Project Manager',
        '"Créer des espaces de rencontre et orchestrer des moments inoubliables avec rigueur, sensibilité et précision."': '"Creating spaces to meet and orchestrating unforgettable moments with rigour, sensitivity and precision."',
        'Voir mes réalisations': 'See my projects',
        'Séminaires': 'Seminars',
        'Soirées étudiantes': 'Student parties',
        'Événements corporate': 'Corporate events',
        'Scénographie': 'Scenography',
        "Jusqu'à 2000 participants": 'Up to 2000 attendees',
        'Budget & logistique': 'Budget & logistics',
        'Rigueur': 'Rigour',
        'Sensibilité': 'Sensitivity',
        'Précision': 'Precision',
        'Terrain': 'Fieldwork',
        'Créativité': 'Creativity',
        'Sang-froid': 'Composure',
        'Fédérateur': 'Team builder',
        'Proactif': 'Proactive',
        'Résilient': 'Resilient',
        /* étiquettes de sections */
        '01 · Parcours pro': '01 · Career',
        '02 · Compétences': '02 · Skills',
        '03 · Profil': '03 · Profile',
        'À propos': 'About',
        /* expériences */
        'Depuis avril 2024': 'Since April 2024',
        'Chef de projet événementiel': 'Event project manager',
        'Prospection et développement commercial : élargissement du portefeuille clients.': 'Prospecting and business development: expanding the client portfolio.',
        'Organisation d’événements : conception et production de séminaires, de galas et soirées de grande envergure, jusqu’à': 'Event organisation: design and production of seminars, galas and large-scale parties, for up to',
        'participants, sur des lieux prestigieux parisiens pour écoles et entreprises issues de divers secteurs.': 'attendees, in prestigious Parisian venues for schools and companies from a range of sectors.',
        'Gestion en autonomie d’une marque du groupe.': 'Autonomous management of one of the group’s brands.',
        'Développement digital : pilotage de la communication et des réseaux sociaux pour accroître la notoriété de la marque.': 'Digital development: running communication and social media to grow brand awareness.',
        'Gestion de projet 360° : budgétisation, chiffrage, coordination logistique, management et suivi des délais.': '360° project management: budgeting, costing, logistics coordination, team management and deadline tracking.',
        'Relation client : accompagnement de la prise de brief à la réalisation, suivi de la satisfaction et fidélisation.': 'Client relations: support from briefing to delivery, satisfaction follow-up and loyalty.',
        'Pilotage financier : suivi des coûts, facturation et optimisation de la rentabilité des projets.': 'Financial management: cost tracking, invoicing and project profitability optimisation.',
        'Management opérationnel et accompagnement d’une équipe d’alternants.': 'Operational management and coaching of a team of work-study students.',
        'Résultats :': 'Results:',
        'Croissance du portefeuille client étudiant et corporate, développement de la visibilité digitale de la marque, organisation d’événements à forte valeur ajoutée.': 'Growth of the student and corporate client portfolio, increased digital visibility for the brand, and high-value events.',
        "Planification et production d'événements de petite à grande envergure, jusqu'à": 'Planning and production of events from small to large scale, for up to',
        'personnes.': 'people.',
        'Budgétisation et suivi des coûts pour assurer la rentabilité.': 'Budgeting and cost tracking to ensure profitability.',
        'Élaboration de chiffrages et de devis pour les projets événementiels.': 'Preparing estimates and quotes for event projects.',
        "Coordination d'équipes multifonctionnelles, y compris des fournisseurs et des sous-traitants.": 'Coordinating cross-functional teams, including suppliers and subcontractors.',
        'Élaboration de calendriers et de listes de tâches pour assurer le respect des délais.': 'Building schedules and task lists to keep to deadlines.',
        "Gestion des aspects logistiques d'un lieu.": 'Managing the logistics of a venue.',
        'Création et mise en œuvre de concepts créatifs pour les événements.': 'Creating and delivering creative concepts for events.',
        'Communication efficace avec les clients pour comprendre leurs besoins et leurs attentes.': 'Effective communication with clients to understand their needs and expectations.',
        "Gestion de la facturation, y compris l'émission de factures aux clients et le suivi des paiements.": 'Invoicing management, including issuing client invoices and tracking payments.',
        'Résolution proactive des problèmes pendant les événements.': 'Proactive problem-solving during events.',
        "Suivi de la satisfaction des clients et collecte de retours d'expérience pour l'amélioration continue.": 'Monitoring client satisfaction and collecting feedback for continuous improvement.',
        "Retours clients positifs. Réalisation d'un chiffre d'affaires de plus d'un million d'euros sur l'année 2023, avec une forte rentabilité.": 'Positive client feedback. Generated more than one million euros in revenue in 2023, with strong profitability.',
        'Assistant chargé de communication': 'Communications assistant',
        'Alternance': 'Work-study',
        'Optimiser la PLV du compte clé : Carrefour.': 'Optimising point-of-sale materials (POS) for the key account: Carrefour.',
        'Assurer la cohérence de la diffusion de la charte graphique.': 'Ensuring consistent use of the brand guidelines.',
        'Superviser la réalisation de visuels.': 'Supervising the production of visuals.',
        'Actualiser, relire, corriger, mettre en ligne les e-catalogues.': 'Updating, proofreading, correcting and publishing e-catalogues.',
        '3 publications de e-catalogues par semaine.': '3 e-catalogue publications per week.',
        /* compétences */
        'Pilotage & Événementiel': 'Management & Events',
        'Gestion de projet 360°': '360° project management',
        'Budgétisation & Chiffrage': 'Budgeting & Costing',
        'Stratégie Commerciale (B2B/B2C)': 'Sales Strategy (B2B/B2C)',
        'Rétroplanning & Logistique': 'Scheduling & Logistics',
        'Scénographie événementielle': 'Event scenography',
        'Négociation fournisseurs': 'Supplier negotiation',
        'Suite Adobe & Communication': 'Adobe Suite & Communication',
        'Création PLV & e-catalogues': 'POS & e-catalogue design',
        'Animation Réseaux sociaux': 'Social media management',
        'Informatique & Numérique': 'IT & Digital',
        "Très à l'aise avec n'importe quel outil digital, j'apprends et m'adapte extrêmement vite à tout nouvel outil. Je rédige, structure et présente l'information avec clarté et rigueur.": 'Very comfortable with any digital tool, I learn and adapt extremely quickly to anything new. I write, structure and present information with clarity and rigour.',
        'Suite Microsoft Office (Excel, Word, PPT)': 'Microsoft Office (Excel, Word, PPT)',
        'Suite Microsoft Office': 'Microsoft Office suite',
        'Outils CRM (Sellsy)': 'CRM tools (Sellsy)',
        'Structuration de données (Notion)': 'Data structuring (Notion)',
        'IA & Automatisation': 'AI & Automation',
        'Automatisation & optimisation de tâches': 'Task automation & optimisation',
        'Langues': 'Languages',
        'Anglais': 'English',
        'Espagnol': 'Spanish',
        'Italien': 'Italian',
        'B2 Avancé': 'B2 Advanced',
        'A2 Intermédiaire': 'A2 Intermediate',
        'A1 Débutant': 'A1 Beginner',
        'Formation Académique': 'Education',
        'BTS Communication': 'BTS in Communication',
        'En Alternance': 'Work-study programme',
        "1ère année École d'Ingénieur": '1st year of engineering school',
        'Baccalauréat Scientifique': 'Scientific Baccalauréat',
        /* soft skills */
        "Pratique assidue du dessin, de la musique et de l'écriture au quotidien.": 'Daily practice of drawing, music and writing.',
        'Événementiel Privé': 'Private Events',
        "Organisation d'événements pour mes amis (élaboration lumière, système son et DJing).": 'Organising events for friends (lighting design, sound system and DJing).',
        'Sport & Évasion': 'Sport & Adventure',
        'Capitaine de rugby (champion IDF 2017). Passionné de randonnée en nature et balades en moto.': 'Rugby captain (Île-de-France champion 2017). Passionate about hiking in nature and motorbike rides.',
        'Relationnel': 'People Skills',
        "Enthousiaste, curieux, sociable et à l'écoute. Grande aisance facilitant le travail en équipe.": 'Enthusiastic, curious, sociable and a good listener. Great ease that makes teamwork natural.',
        /* contact */
        'Un poste, un événement, une collaboration ? Voici comment me joindre.': 'A job, an event, a collaboration? Here is how to reach me.',
        'E-mail': 'Email',
        'Localisation': 'Location',
        'Mobilité': 'Mobility',
        'Permis A2 et B': 'A2 and B driving licences',
        'Que souhaitez-vous me dire ?': 'What would you like to tell me?',
        "Choisissez un motif : l'objet du message est rempli pour vous.": 'Pick a topic: the subject line is filled in for you.',
        'Un poste': 'A job',
        'Un événement': 'An event',
        'Une collaboration': 'A collaboration',
        'Autre': 'Other',
        'Écrire un e-mail': 'Write an email',
        "Copier l'adresse": 'Copy address',
        'Adresse copiée ✓': 'Address copied ✓',
        'Le bouton « Écrire un e-mail » ouvre votre messagerie avec l\'objet déjà rempli.': 'The “Write an email” button opens your email app with the subject already filled in.',
        'Opportunité professionnelle': 'Job opportunity',
        "Organisation d'un événement": 'Event organisation',
        'Proposition de collaboration': 'Collaboration proposal',
        'Autre demande': 'Other request',
        'Bonjour Charles,': 'Hello Charles,',
        /* réalisations */
        'Retour au CV': 'Back to CV',
        "Découvrez en images et en vidéos une sélection des événements que j'ai conçus, produits et coordonnés.": 'Discover, in photos and videos, a selection of the events I designed, produced and coordinated.',
        'Ma sélection arrive bientôt': 'My selection is coming soon',
        "Je prépare mes photos et vidéos d'événements. En attendant, retrouvez mon parcours et mes chiffres clés.": "I'm preparing my event photos and videos. In the meantime, discover my background and key figures.",
        'Mes expériences': 'My experience',
        'Me contacter': 'Contact me',
        'Galas & soirées': 'Galas & parties',
        'Lieux & scénographie': 'Venues & scenography',
        /* mon parcours */
        "Chef de projet événementiel, je conçois, produis et coordonne des séminaires, galas et soirées jusqu'à 2000 participants. Voici ce qui me définit, d'où je viens, et ce que je recherche.": "As an event project manager, I design, produce and coordinate seminars, galas and parties for up to 2000 attendees. Here is what defines me, where I come from, and what I'm looking for.",
        'participants': 'attendees',
        'Taille maximale des événements pilotés': 'Largest event size managed',
        "de chiffre d'affaires": 'in revenue',
        'Réalisé en 2023, avec une forte rentabilité': 'Achieved in 2023, with strong profitability',
        'marque gérée en autonomie': 'brand managed autonomously',
        'Au sein du Groupe Eden System': 'Within Groupe Eden System',
        'gestion de projet': 'project management',
        'Budget, logistique, équipes, facturation': 'Budget, logistics, teams, invoicing',
        "Ce que j'apporte à une équipe": 'What I bring to a team',
        'Réactivité sur le terrain': 'Reactivity in the field',
        'Je résous les imprévus en temps réel. Face à un problème, je ne panique pas : je trouve toujours une issue fonctionnelle.': "I solve the unexpected in real time. Faced with a problem, I don't panic: I always find a workable way out.",
        'Rigueur, de A à Z': 'Rigour, from A to Z',
        'Budgétisation, chiffrage, rétroplanning, logistique, facturation : je pilote un projet de bout en bout, sans micro-management.': 'Budgeting, costing, scheduling, logistics, invoicing: I run a project end to end, without micro-management.',
        'Relation client durable': 'Lasting client relationships',
        "De la prise de brief à la fidélisation, j'accompagne chaque client et je suis la satisfaction après l'événement.": 'From the briefing to client loyalty, I support every client and follow up on satisfaction after the event.',
        "Management d'équipe": 'Team management',
        "J'encadre une équipe d'alternants et je coordonne fournisseurs et sous-traitants, avec enthousiasme et écoute.": 'I lead a team of work-study students and coordinate suppliers and subcontractors, with enthusiasm and attentiveness.',
        'Un parcours dicté par le pragmatisme': 'A path driven by pragmatism',
        "L'expérience concrète en entreprise et la réalité du terrain valent plus pour moi qu'une longue poursuite d'études théoriques.": 'For me, hands-on experience in a company and the reality of the field are worth more than a long pursuit of theoretical studies.',
        "Le déclic, et le choix de l'action": 'The spark, and the choice of action',
        "Après un début en école d'ingénieurs, j'ai découvert la vie associative étudiante : une révélation, et un goût viscéral pour l'événementiel, né de l'envie de rassembler les gens et de créer des souvenirs mémorables. J'ai assumé une réorientation vers un BTS Communication en alternance.": 'After starting in engineering school, I discovered student associations: a revelation, and a deep-rooted taste for events, born from the desire to bring people together and create memorable moments. I embraced a change of direction towards a BTS in Communication through a work-study programme.',
        'Réorientation assumée': 'Deliberate career change',
        'BTS en alternance': 'BTS work-study',
        'Des fondations exigeantes': 'Demanding foundations',
        "Mon premier poste de chef de projet, au Pavillon d'Armenonville, a été fondateur. Dans un lieu aussi prestigieux et exigeant, j'ai forgé ma rigueur logistique, consolidé mon sang-froid et validé définitivement mon choix de carrière.": "My first project manager role, at the Pavillon d'Armenonville, was formative. In such a prestigious and demanding venue, I built my logistical rigour, strengthened my composure and definitively confirmed my career choice.",
        "Événements jusqu'à 2000 pers.": 'Events up to 2000 people',
        "Plus d'1 M€ de CA": 'Over €1M revenue',
        "L'autonomie et la responsabilité": 'Autonomy and responsibility',
        'Au sein du Groupe Eden System, je gère en autonomie une marque du groupe. Je conçois et produis des séminaires, galas et soirées de grande envergure, pour des écoles et des entreprises de secteurs variés, tout en développant le portefeuille clients.': "Within Groupe Eden System, I autonomously manage one of the group's brands. I design and produce large-scale seminars, galas and parties for schools and companies in a variety of sectors, while growing the client portfolio.",
        'Écoles & entreprises': 'Schools & companies',
        'Autonomie': 'Autonomy',
        "Management d'alternants": 'Managing work-study students',
        'Le « Couteau-Suisse Numérique »': 'The “Digital Swiss Army Knife”',
        "Je vis pour le terrain, mais je m'appuie sur le digital pour optimiser mon temps et mes process. Très à l'aise avec n'importe quel outil, j'apprends et je m'adapte extrêmement vite à chaque nouveauté.": 'I live for the field, but I rely on digital tools to optimise my time and processes. Very comfortable with any tool, I learn and adapt extremely quickly to anything new.',
        'outils': 'tools',
        'Tout': 'All',
        'Gestion & vente': 'Management & sales',
        'Création': 'Creative',
        'IA & automatisation': 'AI & automation',
        'CRM : suivi commercial, gestion client et conversions.': 'CRM: sales follow-up, client management and conversions.',
        'Bases de données et tableaux de bord pour suivre leads et candidatures.': 'Databases and dashboards to track leads and applications.',
        'Excel, Word, PowerPoint : chiffrages, devis et présentations.': 'Excel, Word, PowerPoint: costings, quotes and presentations.',
        'Visuels et supports de communication (PLV).': 'Visuals and communication materials (POS).',
        'Mise en page et e-catalogues.': 'Layout and e-catalogues.',
        'Montage vidéo.': 'Video editing.',
        'Réseaux sociaux': 'Social media',
        "Animation et communication pour accroître la notoriété d'une marque.": 'Community management and communication to build brand awareness.',
        'Rédaction, idéation et gains de productivité au quotidien.': 'Writing, ideation and daily productivity gains.',
        'Images et pistes créatives.': 'Images and creative directions.',
        'Automatisation': 'Automation',
        'Optimisation des tâches répétitives.': 'Optimising repetitive tasks.',
        "Création d'outils et de pages web avec l'IA.": 'Building tools and web pages with AI.',
        'Ce que je recherche': "What I'm looking for",
        "Un poste de chef de projet événementiel qui garde du terrain et de l'action : concevoir, produire et coordonner des événements d'envergure, avec de l'autonomie et une équipe à animer.": 'An event project manager role that keeps the field and the action: designing, producing and coordinating large-scale events, with autonomy and a team to lead.',
        'Terrain & action': 'Field & action',
        "Événements d'envergure": 'Large-scale events',
        'ou sur': 'or on',
        'Contactez-moi': 'Get in touch',
        'Paris (75) • Permis A2 et B': 'Paris (75) • A2 and B driving licences',
        'Statistiques de visite anonymes, sans cookies.': 'Anonymous visit statistics, no cookies.',
        /* attributs d'accessibilité */
        'Navigation principale': 'Main navigation',
        'Charles Marti, accueil': 'Charles Marti, home',
        'Défiler vers les expériences': 'Scroll to experience',
        'Motif du message': 'Message topic',
        'Filtrer les réalisations': 'Filter projects',
        'Filtrer les outils par catégorie': 'Filter tools by category',
        "M'envoyer un e-mail": 'Email me',
        'Mon profil LinkedIn (nouvel onglet)': 'My LinkedIn profile (new tab)',
        'Aperçu de la réalisation': 'Project preview',
        'Fermer': 'Close',
        'Précédent': 'Previous',
        'Suivant': 'Next',
        'Vidéo de réalisation': 'Project video'
    };

    /* Titres de sections : [texte avant le mot en dégradé, mot en dégradé] */
    const TITLES = {
        'Expériences Professionnelles': ['Work ', 'Experience'],
        'Expertises & Formation': ['Expertise & ', 'Education'],
        'Soft Skills & Hobbies': ['Soft Skills & ', 'Hobbies'],
        'Travaillons ensemble': ["Let's work ", 'together'],
        'Mes Réalisations': ['My ', 'Projects'],
        'Mon ADN & Mon Parcours': ['My DNA & My ', 'Journey']
    };

    const META = {
        title: ['Charles Marti - Chef de Projet Événementiel', 'Charles Marti - Event Project Manager'],
        description: ["Charles Marti, chef de projet événementiel à Paris : séminaires, galas et soirées jusqu'à 2000 participants, pour écoles et entreprises.",
                      'Charles Marti, event project manager in Paris: seminars, galas and parties for up to 2000 attendees, for schools and companies.'],
        ogTitle: ['Charles Marti - Chef de Projet Événementiel', 'Charles Marti - Event Project Manager'],
        ogDescription: ["Séminaires, galas et soirées jusqu'à 2000 participants. Découvrez mon parcours et mes réalisations.",
                        'Seminars, galas and parties for up to 2000 attendees. Discover my background and my projects.']
    };

    /* ============================ MOTEUR DE LANGUE ============================ */
    const norm = s => s.replace(/\s+/g, ' ').trim();
    const ATTRS = ['aria-label', 'alt', 'title', 'placeholder'];
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);
    const origText = new WeakMap();
    const origAttr = new WeakMap();
    const missing = new Set();
    let lang = 'fr';

    const skipped = el => el.hasAttribute && el.hasAttribute('data-i18n-skip');

    function trText(n) {
        const p = n.parentElement;
        if (!p || p.closest('[data-i18n-skip], h3.title-pastel') || SKIP_TAGS.has(p.tagName)) return;
        const raw = origText.has(n) ? origText.get(n) : n.nodeValue;
        const key = norm(raw);
        if (!key) return;
        if (!origText.has(n)) origText.set(n, raw);
        if (lang === 'fr') { if (n.nodeValue !== raw) n.nodeValue = raw; return; }
        const t = EN[key];
        if (t === undefined) {
            if (/[A-Za-zÀ-ÿ]{3,}/.test(key)) missing.add(key);
            if (n.nodeValue !== raw) n.nodeValue = raw;
            return;
        }
        n.nodeValue = raw.match(/^\s*/)[0] + t + raw.match(/\s*$/)[0];
    }

    function trAttrs(el) {
        if (!el.hasAttribute || el.closest('[data-i18n-skip]')) return;
        ATTRS.forEach(a => {
            if (!el.hasAttribute(a)) return;
            let o = origAttr.get(el);
            if (!o) { o = {}; origAttr.set(el, o); }
            if (!(a in o)) o[a] = el.getAttribute(a);
            const t = lang === 'en' ? EN[norm(o[a])] : undefined;
            el.setAttribute(a, t !== undefined ? t : o[a]);
        });
    }

    function trTitle(h) {
        if (!h.dataset.frFirst) {
            const first = [...h.childNodes].find(n => n.nodeType === 3);
            const grad = h.querySelector('.grad');
            if (!first || !grad) return;
            h.dataset.frFirst = first.nodeValue;
            h.dataset.frGrad = grad.textContent;
            h.dataset.frKey = norm(h.dataset.frFirst + h.dataset.frGrad);
        }
        const first = [...h.childNodes].find(n => n.nodeType === 3);
        const grad = h.querySelector('.grad');
        const t = lang === 'en' ? TITLES[h.dataset.frKey] : null;
        first.nodeValue = t ? t[0] : h.dataset.frFirst;
        grad.textContent = t ? t[1] : h.dataset.frGrad;
        if (lang === 'en' && !t) missing.add(h.dataset.frKey);
    }

    function translateTree(node) {
        if (node.nodeType === 3) { trText(node); return; }
        if (node.nodeType !== 1 || SKIP_TAGS.has(node.tagName) || skipped(node)) return;
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
            acceptNode: n => n.nodeType === 1
                ? (SKIP_TAGS.has(n.tagName) || skipped(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP)
                : NodeFilter.FILTER_ACCEPT
        });
        while (walker.nextNode()) trText(walker.currentNode);
        trAttrs(node);
        node.querySelectorAll('[aria-label],[alt],[title],[placeholder]').forEach(trAttrs);
        node.querySelectorAll('h3.title-pastel').forEach(trTitle);
        if (node.matches && node.matches('h3.title-pastel')) trTitle(node);
    }

    function setMeta() {
        const i = lang === 'en' ? 1 : 0;
        document.title = META.title[i];
        const set = (sel, v) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', v); };
        set('meta[name="description"]', META.description[i]);
        set('meta[property="og:title"]', META.ogTitle[i]);
        set('meta[property="og:description"]', META.ogDescription[i]);
        set('meta[property="og:locale"]', lang === 'en' ? 'en_GB' : 'fr_FR');
    }

    const tr = s => (lang === 'en' && EN[norm(String(s))] !== undefined) ? EN[norm(String(s))] : s;

    /* ============================ THÈME ============================ */
    const isDark = () => root.classList.contains('dark');

    function syncThemeUI() {
        const dark = isDark();
        document.querySelectorAll('.theme-toggle').forEach(b => {
            b.setAttribute('aria-pressed', String(dark));
            b.setAttribute('aria-label', lang === 'en'
                ? (dark ? 'Switch to light mode' : 'Switch to dark mode')
                : (dark ? 'Passer en mode clair' : 'Passer en mode sombre'));
            const i = b.querySelector('i');
            if (i) i.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', dark ? '#101216' : '#FCFBF9');
    }

    function setTheme(dark, persist) {
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
            root.classList.add('theme-anim');
            clearTimeout(setTheme.t);
            setTheme.t = setTimeout(() => root.classList.remove('theme-anim'), 500);
        }
        root.classList.toggle('dark', dark);
        if (persist) store.set('site-theme', dark ? 'dark' : 'light');
        syncThemeUI();
        document.dispatchEvent(new CustomEvent('themechange', { detail: { dark } }));
    }

    /* ============================ LANGUE ============================ */
    function syncLangUI() {
        document.querySelectorAll('.lang-toggle').forEach(b => {
            b.textContent = lang === 'en' ? 'FR' : 'EN';
            b.setAttribute('aria-label', lang === 'en' ? 'Passer le site en français' : 'Switch the site to English');
            b.setAttribute('title', lang === 'en' ? 'Français' : 'English');
        });
    }

    function setLang(l, persist) {
        lang = l === 'en' ? 'en' : 'fr';
        root.lang = lang;
        translateTree(document.body);
        setMeta();
        syncLangUI();
        syncThemeUI();
        if (persist) store.set('site-lang', lang);
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    }

    /* Nouveaux éléments créés par les scripts (galerie, compteurs...) : traduits au vol */
    new MutationObserver(muts => {
        if (lang !== 'en') return;
        muts.forEach(m => m.addedNodes.forEach(n => {
            const host = n.nodeType === 1 ? n : n.parentElement;
            if (host && host.closest && host.closest('.count')) return;
            translateTree(n);
        }));
    }).observe(document.body, { childList: true, subtree: true });

    function init() {
        const q = new URLSearchParams(location.search).get('lang');
        const saved = store.get('site-lang');
        const browser = (navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
        const wanted = (q === 'en' || q === 'fr') ? q : (saved || browser);
        // thème
        const savedTheme = store.get('site-theme');
        const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme ? savedTheme === 'dark' : prefersDark) root.classList.add('dark');
        syncThemeUI();

        document.querySelectorAll('.theme-toggle').forEach(b => b.addEventListener('click', () => setTheme(!isDark(), true)));
        document.querySelectorAll('.lang-toggle').forEach(b => b.addEventListener('click', () => setLang(lang === 'en' ? 'fr' : 'en', true)));
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { if (!store.get('site-theme')) setTheme(e.matches, false); });

        if (wanted === 'en') setLang('en', false); else { lang = 'fr'; root.lang = 'fr'; syncLangUI(); }
    }

    window.SITE = { tr, lang: () => lang, isDark, setTheme, setLang, missing: () => [...missing] };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
