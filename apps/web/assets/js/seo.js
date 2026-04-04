/**
 * CosMos Global SEO & Metadata Manager
 * Dynamically updates page titles and meta tags for production readiness.
 */

const PAGE_METADATA = {
    'main.html': {
        title: 'CosMos | Explore the Universe',
        description: 'Journey through the Universe with interactive 3D visualizations, real-time planetary data, and an AI-powered space assistant.'
    },
    'dashboard.html': {
        title: 'Live Space Dashboard | CosMos',
        description: 'Real-time cosmic data feeds, ISS tracking, and NASA Picture of the Day.'
    },
    'exoplanets.html': {
        title: 'Alien Worlds Catalog | CosMos',
        description: 'Tour the strangest and most extreme worlds discovered far beyond our solar system.'
    },
    'hindu.html': {
        title: 'Vedic Astronomy | Ancient Cosmic Wisdom',
        description: 'Discover ancient Indian cosmic insights, the map of the Nakshatras, and the cycles of time.'
    },
    'scale.html': {
        title: 'Scale of the Universe | Interactive Comparison',
        description: 'How small are we really? Journey from Earth to the boundaries of the observable universe.'
    },
    'future.html': {
        title: 'Future of Humanity | The Final Frontier',
        description: 'Mars colonies, Dyson Spheres, and the coming millennia of human space exploration.'
    },
    'missions.html': {
        title: 'Space Missions Timeline | Humanity\'s Journey',
        description: 'From Apollo 11 to the James Webb Telescope. A history of our greatest cosmic achievements.'
    },
    'jarvis.html': {
        title: 'AI Control Room | Ship Computer',
        description: 'Engage with our dedicated cosmic AI assistant for deep space telemetry and queries.'
    },
    'quiz.html': {
        title: 'Cosmic Quiz | Test Your Knowledge',
        description: 'Challenge yourself with our interactive space quiz and unlock new cosmic secrets.'
    },
    'deepspace.html': {
        title: 'Deep Space Phenomena | CosMos',
        description: 'Explore black holes, supernovas, and the extreme physics of the deep universe.'
    }
};

function initSEO() {
    const currentPage = window.location.pathname.split('/').pop() || 'main.html';
    const metadata = PAGE_METADATA[currentPage] || {
        title: 'CosMos | Journey through the Universe',
        description: 'An interactive exploration of space, time, and beyond.'
    };

    // Update Title
    document.title = metadata.title;

    // Update or Create Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = metadata.description;

    // Add Open Graph Tags if they don't exist
    injectOGTags(metadata);
}

function injectOGTags(metadata) {
    const ogData = {
        'og:title': metadata.title,
        'og:description': metadata.description,
        'og:type': 'website',
        'og:image': 'https://cosmos-project.com/assets/images/og-preview.jpg', // Placeholder
        'twitter:card': 'summary_large_image',
        'twitter:title': metadata.title,
        'twitter:description': metadata.description
    };

    for (const [property, content] of Object.entries(ogData)) {
        let tag = property.startsWith('twitter:') 
            ? document.querySelector(`meta[name="${property}"]`)
            : document.querySelector(`meta[property="${property}"]`);
        
        if (!tag) {
            tag = document.createElement('meta');
            if (property.startsWith('twitter:')) {
                tag.name = property;
            } else {
                tag.setAttribute('property', property);
            }
            document.head.appendChild(tag);
        }
        tag.content = content;
    }
}

// Run immediately
initSEO();
