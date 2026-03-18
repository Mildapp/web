// Global variable for video autoplay function
let triggerHeroVideoAutoPlay = null;

// Function to handle scroll and animate decorative elements
function initScrollAnimation() {
    const heroSection = document.querySelector('.hero-section');
    const heroContainer = document.querySelector('.hero-container');
    // Important: .phone-mockup now includes Tabs, so center should be taken from phone area
    // (phones-container), otherwise on some resizes decor doesnt align strictly behind phone.
    const phoneTarget = document.querySelector('.phones-container')
        || document.querySelector('.phone-frame.active')
        || document.querySelector('.phone-frame')
        || document.querySelector('.phone-mockup');
    
    // Elements by rows
    const row1 = [
        document.querySelector('.hero-decor-1'), // Garlic
        document.querySelector('.hero-decor-3')   // Pepper
    ];
    
    const row2 = [
        document.querySelector('.hero-decor-2'), // Olive oil
        document.querySelector('.hero-decor-4')  // Cheese
    ];
    
    const row3 = [
        document.querySelector('.hero-decor-5'), // Pasta
        document.querySelector('.hero-decor-6')  // Zucchini
    ];
    
    if (!heroSection || !heroContainer || !phoneTarget) return;
    
    // Calculate phone center and apply offsets for all elements
    function calculateAndApplyOffsets() {
        const phoneRect = phoneTarget.getBoundingClientRect();
        const containerRect = heroContainer.getBoundingClientRect();

       
        if (window.matchMedia('(max-width: 768px)').matches) {
            const heroDescription = heroContainer.querySelector('.hero-description');
            if (heroDescription) {
                const descRect = heroDescription.getBoundingClientRect();
                const descTop = descRect.top - containerRect.top;
                const descBottom = descRect.bottom - containerRect.top;

            
                const imageHeight = 72; 
                const row1Top = Math.round(descTop - imageHeight - 10);
                
                // Row 2 (olives and cheese) 6px below description text end
                const row2Top = Math.round(descBottom -30);
                const rowGap = 72; // for row 3
                const row3Top = row2Top + rowGap;

                heroContainer.style.setProperty('--decor-row1-top', `${row1Top}px`);
                heroContainer.style.setProperty('--decor-row2-top', `${row2Top}px`);
                heroContainer.style.setProperty('--decor-row3-top', `${row3Top}px`);

                // Cascade by width: row 2 narrower by 20%, row 3 by another 20%.
                // Implemented via symmetric inset left/right.
                const base = 20;
                const span = Math.max(0, containerRect.width - base * 2);
                const inset2 = Math.round(span * 0.10); // narrow by 20% => 10% from each side
                const inset3 = Math.round(span * 0.20); // another 20% => 20% from each side

                heroContainer.style.setProperty('--decor-inset-1', `0px`);
                heroContainer.style.setProperty('--decor-inset-2', `${inset2}px`);
                heroContainer.style.setProperty('--decor-inset-3', `${inset3}px`);
            }
        }
        
        // Phone center relative to container
        const phoneCenterX = phoneRect.left - containerRect.left + phoneRect.width / 2;
        const phoneCenterY = phoneRect.top - containerRect.top + phoneRect.height / 2;
        
        // Apply offsets to all elements
        const allElements = [...row1, ...row2, ...row3];
        
        allElements.forEach((el) => {
            if (!el) return;
            
            const elRect = el.getBoundingClientRect();
            
            // Current element center relative to container
            const elCenterX = elRect.left - containerRect.left + elRect.width / 2;
            const elCenterY = elRect.top - containerRect.top + elRect.height / 2;
            
            // Offset to phone center
            const offsetX = phoneCenterX - elCenterX;
            const offsetY = phoneCenterY - elCenterY;
            
            // Apply via CSS variables
            el.style.setProperty('--target-x', `${offsetX}px`);
            el.style.setProperty('--target-y', `${offsetY}px`);
        });
    }
    
    // Call on load and resize
    calculateAndApplyOffsets();
    window.addEventListener('resize', calculateAndApplyOffsets);
    
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const heroSectionTop = heroSection.offsetTop;
        const heroSectionHeight = heroSection.offsetHeight;
        const phoneTop = phoneTarget.getBoundingClientRect().top + scrollTop;
        const scrollProgress = scrollTop - heroSectionTop;
        
        // Calculate relative scroll progress (0-1)
        const maxScroll = heroSectionHeight;
        const scrollRatio = Math.max(0, Math.min(1, scrollProgress / maxScroll));
        
        // Check if we are within hero-section bounds
        if (scrollProgress < 0 || scrollProgress > heroSectionHeight) {
            // If outside section, reset all classes
            [...row1, ...row2, ...row3].forEach(el => {
                if (el) el.classList.remove('hide-behind-phone');
            });
            return;
        }
        
        // Scroll thresholds for each row (as percentage of section height)
        // Animation starts immediately on scroll
        const threshold1 = 0.01; // 1% section scroll - starts immediately
        const threshold2 = 0.05; // 5% section scroll
        const threshold3 = 0.10; // 10% section scroll
        
        // Row 1: Garlic and Pepper - hide first
        if (scrollRatio >= threshold1) {
            row1.forEach(el => {
                if (el) el.classList.add('hide-behind-phone');
            });
        } else {
            row1.forEach(el => {
                if (el) el.classList.remove('hide-behind-phone');
            });
        }
        
        // Row 2: Olive oil and Cheese - hide second
        if (scrollRatio >= threshold2) {
            row2.forEach(el => {
                if (el) el.classList.add('hide-behind-phone');
            });
        } else {
            row2.forEach(el => {
                if (el) el.classList.remove('hide-behind-phone');
            });
        }
        
        // Row 3: Pasta and Zucchini - hide last
        if (scrollRatio >= threshold3) {
            row3.forEach(el => {
                if (el) el.classList.add('hide-behind-phone');
            });
            // Autoplay first video when row3 hides
            if (triggerHeroVideoAutoPlay) {
                triggerHeroVideoAutoPlay();
            }
        } else {
            row3.forEach(el => {
                if (el) el.classList.remove('hide-behind-phone');
            });
        }
    }
    
    // Use requestAnimationFrame for smooth animation
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Call immediately for initial state
    handleScroll();
}

// Function to switch tabs and animate phones
function initTabSwitcher() {
    const tabs = document.querySelectorAll('.hero-tab');
    const phones = document.querySelectorAll('.phone-slide');
    const phonesContainer = document.querySelector('.phones-container');
    
    if (!tabs.length || !phones.length) return;
    
    let isAnimating = false;
    const tabOrder = ['voice', 'snap', 'text'];
    
    // Check if mobile version
    function isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }
    
    // Initialize: set first tab active if none is active
    function initializeActiveTab() {
        const activeTab = Array.from(tabs).find(t => t.classList.contains('active'));
        const activePhone = Array.from(phones).find(p => p.classList.contains('active'));
        
        if (!activeTab) {
            // If no active tab, activate first (snap by default in HTML)
            const defaultTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === 'snap') || tabs[0];
            if (defaultTab) {
                defaultTab.classList.add('active');
                defaultTab.setAttribute('data-state', 'active');
            }
        }
        
        if (!activePhone) {
            // If no active phone, activate corresponding one
            const activeTabName = (Array.from(tabs).find(t => t.classList.contains('active')) || {}).getAttribute('data-tab') || 'snap';
            const defaultPhone = Array.from(phones).find(p => p.getAttribute('data-tab') === activeTabName);
            if (defaultPhone) {
                defaultPhone.classList.add('active');
            }
        }
        
        // On mobile: scroll to active phone
        if (isMobile() && phonesContainer) {
            const activeTabName = (Array.from(tabs).find(t => t.classList.contains('active')) || {}).getAttribute('data-tab') || 'snap';
            const activePhone = Array.from(phones).find(p => p.getAttribute('data-tab') === activeTabName);
            if (activePhone) {
                // Small delay for proper element positioning
                setTimeout(() => {
                    phonesContainer.scrollTo({
                        left: activePhone.offsetLeft - phonesContainer.offsetLeft,
                        behavior: 'auto' // no animation on init
                    });
                    // Update active class on phones
                    phones.forEach(p => p.classList.remove('active'));
                    activePhone.classList.add('active');
                    // Initialize opacity
                    if (window.updatePhonesOpacity) {
                        window.updatePhonesOpacity();
                    }
                }, 100);
            }
        }
    }
    
    // Get active phone index based on scroll (for mobile)
    function getActivePhoneIndexFromScroll() {
        if (!isMobile() || !phonesContainer) return -1;
        
        const containerRect = phonesContainer.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        phones.forEach((phone, index) => {
            const phoneRect = phone.getBoundingClientRect();
            const phoneCenter = phoneRect.left + phoneRect.width / 2;
            const distance = Math.abs(phoneCenter - containerCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });
        
        return closestIndex;
    }
    
    
    // Update active tab based on active phone
    function updateActiveTabFromPhone() {
        if (!isMobile()) return;
        
        const activeIndex = getActivePhoneIndexFromScroll();
        if (activeIndex === -1) return;
        
        const activePhone = phones[activeIndex];
        if (!activePhone) return;
        
        const activeTabName = activePhone.getAttribute('data-tab');
        const activeTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === activeTabName);
        
        if (activeTab && !activeTab.classList.contains('active')) {
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('data-state', 'default');
            });
            
            // Add active class to selected tab
            activeTab.classList.add('active');
            activeTab.setAttribute('data-state', 'active');
            
            // Switch video
            if (window.playActiveTabVideo) {
                window.playActiveTabVideo();
            }
        }
    }
    
    // Function to switch to specific tab
    function switchToTab(tabName) {
        // Prevent multiple switches during animation
        if (isAnimating) return;
        
        // Find tab by name
        const targetTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === tabName);
        if (!targetTab) return;
        
        // Find current active tab
        const currentActiveTab = Array.from(tabs).find(t => t.classList.contains('active'));
        
        // Check if this tab is already selected
        if (currentActiveTab && currentActiveTab.getAttribute('data-tab') === tabName) return;
        
        isAnimating = true;
        
        // Remove active class from all tabs (immediately)
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('data-state', 'default');
        });
        
        // Find target phone
        const targetPhone = document.querySelector(`.phone-slide[data-tab="${tabName}"]`);
        
        if (isMobile() && phonesContainer && targetPhone) {
            // On mobile: use scroll
            phonesContainer.scrollTo({
                left: targetPhone.offsetLeft - phonesContainer.offsetLeft,
                behavior: 'smooth'
            });
            
            // Update active class on phones
            phones.forEach(p => p.classList.remove('active'));
            targetPhone.classList.add('active');
            
            // Update opacity after scroll
            setTimeout(() => {
                if (window.updatePhonesOpacity) {
                    window.updatePhonesOpacity();
                }
            }, 100);
            
            // Activate tab and switch video after animation completes
            setTimeout(() => {
                // Activate tab only when phone fully appeared
                targetTab.classList.add('active');
                targetTab.setAttribute('data-state', 'active');
                
                if (window.playActiveTabVideo) {
                    window.playActiveTabVideo();
                }
                isAnimating = false;
            }, 250);
        } else {
            // On desktop: use old mechanism with classes
            const currentActivePhone = document.querySelector('.phone-slide.active');
            
            if (currentActivePhone && targetPhone && currentActivePhone !== targetPhone) {
                // Clear all animation classes from all phones
                phones.forEach(p => {
                    p.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
                });
                
                // Ensure new phone doesnt have active class before animation
                targetPhone.classList.remove('active');
                
                // Determine animation direction
                const currentIndex = tabOrder.indexOf(currentActivePhone.getAttribute('data-tab'));
                const targetIndex = tabOrder.indexOf(tabName);
                
                if (targetIndex > currentIndex) {
                    // Transition right: current exits left, new enters from right
                    currentActivePhone.classList.remove('active');
                    currentActivePhone.classList.add('slide-out-left');
                    targetPhone.classList.add('slide-in-right');
                } else {
                    // Transition left: current exits right, new enters from left
                    currentActivePhone.classList.remove('active');
                    currentActivePhone.classList.add('slide-out-right');
                    targetPhone.classList.add('slide-in-left');
                }
                
                setTimeout(() => {
                    if (targetIndex > currentIndex) {
                        targetPhone.classList.remove('slide-in-right');
                    } else {
                        targetPhone.classList.remove('slide-in-left');
                    }
                    targetPhone.classList.add('active');
                }, 30);
                
                setTimeout(() => {
                    if (targetIndex > currentIndex) {
                        currentActivePhone.classList.remove('slide-out-left');
                    } else {
                        currentActivePhone.classList.remove('slide-out-right');
                    }
                    
                    // Activate tab only when phone fully appeared
                    targetTab.classList.add('active');
                    targetTab.setAttribute('data-state', 'active');
                    
                    isAnimating = false;
                    // Switch video after animation completes
                    if (window.playActiveTabVideo) {
                        window.playActiveTabVideo();
                    }
                }, 320);
            } else {
                isAnimating = false;
            }
        }
    }
    
    // Function to switch video in active tab (available globally)
    window.playActiveTabVideo = function() {
        const allPhones = document.querySelectorAll('.phone-slide');
        const container = document.querySelector('.phones-container');
        const isMobileView = window.matchMedia('(max-width: 768px)').matches;
        
        let activePhone;
        
        if (isMobileView && container && allPhones.length > 0) {
            // On mobile: find active phone via scroll
            const containerRect = container.getBoundingClientRect();
            const containerCenter = containerRect.left + containerRect.width / 2;
            
            let closestIndex = 0;
            let closestDistance = Infinity;
            
            allPhones.forEach((phone, index) => {
                const phoneRect = phone.getBoundingClientRect();
                const phoneCenter = phoneRect.left + phoneRect.width / 2;
                const distance = Math.abs(phoneCenter - containerCenter);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });
            
            if (allPhones[closestIndex]) {
                activePhone = allPhones[closestIndex];
            }
        } else {
            // On desktop: use active class
            activePhone = document.querySelector('.phone-slide.active');
        }
        
        if (!activePhone) return;
        
        const activeVideo = activePhone.querySelector('.hero-frame-video');
        const allHeroVideos = document.querySelectorAll('.hero-frame-video');
        
        if (activeVideo && allHeroVideos.length > 0) {
            // Stop all videos
            allHeroVideos.forEach(video => {
                if (video !== activeVideo) {
                    video.pause();
                    video.currentTime = 0;
                }
            });
            // Play active video
            activeVideo.play().catch(err => {
                console.log('Hero video play error:', err);
            });
            
            // Reset preloader for active video if not loaded yet
            const activePreloader = activePhone.querySelector('.video-preloader');
            if (activePreloader && activeVideo.readyState < 2) {
                // If video not loaded yet, show preloader with delay
                setTimeout(() => {
                    if (activeVideo.readyState < 2 && !activePreloader.classList.contains('active')) {
                        activePreloader.classList.add('active');
                    }
                }, 200);
            }
        }
    };
    
    // Tab click handlers
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchToTab(tabName);
        });
    });
    
    // Function for smooth phone opacity change on scroll
    function updatePhonesOpacity() {
        if (!isMobile() || !phonesContainer) return;
        
        const containerRect = phonesContainer.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        const containerWidth = containerRect.width;
        
        // Threshold for full fade (when phone is completely out of view)
        // Use 35% of container width for smoother transition
        const fadeThreshold = containerWidth * 0.35;
        
        phones.forEach((phone) => {
            const phoneRect = phone.getBoundingClientRect();
            const phoneCenter = phoneRect.left + phoneRect.width / 2;
            
            // Distance from phone center to container center
            const distance = Math.abs(phoneCenter - containerCenter);
            
            // Calculate opacity: 1 when phone is centered, 0 when far
            // Normalize distance
            let normalizedDistance = Math.min(1, distance / fadeThreshold);
            
            // Use cubic curve for smoother fade (ease-out)
            // This creates more natural transition
            let opacity = 1 - normalizedDistance;
            opacity = opacity * opacity * opacity; // Cubic curve
            
            // Limit opacity from 0 to 1
            opacity = Math.max(0, Math.min(1, opacity));
            
            // Apply opacity
            phone.style.opacity = opacity;
        });
    }
    
    // Make function globally available for calls from other places
    window.updatePhonesOpacity = updatePhonesOpacity;
    
    // Scroll handler for tab sync and smooth opacity change (mobile only)
    if (phonesContainer && isMobile()) {
        let scrollTimeout;
        let scrollAnimationFrame = null;
        
        phonesContainer.addEventListener('scroll', () => {
            // Update opacity on each scroll (use requestAnimationFrame for smoothness)
            if (scrollAnimationFrame) {
                cancelAnimationFrame(scrollAnimationFrame);
            }
            scrollAnimationFrame = requestAnimationFrame(() => {
                updatePhonesOpacity();
            });
            
            // Update tabs with small delay
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updateActiveTabFromPhone();
            }, 100);
        }, { passive: true });
        
        // Initialize opacity on load
        setTimeout(() => {
            updatePhonesOpacity();
        }, 150);
    }
    
    // Swipe handlers for desktop version (if needed)
    if (phonesContainer && !isMobile()) {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        const minSwipeDistance = 50; // Minimum swipe distance
        
        phonesContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        phonesContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeDistanceX = touchEndX - touchStartX;
            const swipeDistanceY = touchEndY - touchStartY;
            
            // Check that this is horizontal swipe (not vertical scroll)
            if (Math.abs(swipeDistanceY) > Math.abs(swipeDistanceX)) return;
            
            // Check if swipe is long enough
            if (Math.abs(swipeDistanceX) < minSwipeDistance) return;
            
            // Find current active tab
            const activeTab = Array.from(tabs).find(t => t.classList.contains('active'));
            if (!activeTab) return;
            
            const currentTabName = activeTab.getAttribute('data-tab');
            const currentIndex = tabOrder.indexOf(currentTabName);
            
            if (currentIndex === -1) return;
            
            // Determine swipe direction
            if (swipeDistanceX > 0) {
                // Swipe right (finger left to right) -> show PREVIOUS tab
                if (currentIndex > 0) {
                    const prevIndex = currentIndex - 1;
                    switchToTab(tabOrder[prevIndex]);
                }
            } else {
                // Swipe left (finger right to left) -> show NEXT tab
                if (currentIndex < tabOrder.length - 1) {
                    const nextIndex = currentIndex + 1;
                    switchToTab(tabOrder[nextIndex]);
                }
            }
        }
    }
    
    // Initialize active tab on load
    initializeActiveTab();
    
    // Initialize video control
    initHeroVideoControl();
}

// Function to control video in hero section
function initHeroVideoControl() {
    const heroVideos = document.querySelectorAll('.hero-frame-video');
    let hasAutoPlayed = false;
    
    // Function for first video autoplay (called on scroll)
    triggerHeroVideoAutoPlay = function() {
        if (hasAutoPlayed) return;
        hasAutoPlayed = true;
        
        // Find active phone and its video
        const activePhone = document.querySelector('.phone-slide.active');
        if (!activePhone) {
            console.log('Hero autoplay: No active phone found');
            return;
        }
        
        const activeVideo = activePhone.querySelector('.hero-frame-video');
        if (!activeVideo) {
            console.log('Hero autoplay: No video found in active phone');
            return;
        }
        
        // Stop all other videos
        heroVideos.forEach(video => {
            if (video !== activeVideo) {
                video.pause();
                video.currentTime = 0;
            }
        });
        
        // Ensure video is loaded before playing
        function attemptPlay() {
            if (activeVideo.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                // Ensure video has required attributes for autoplay
                if (!activeVideo.muted) {
                    activeVideo.muted = true;
                }
                activeVideo.setAttribute('playsinline', '');
                
                activeVideo.play().then(() => {
                    // Check if video is actually playing
                    setTimeout(() => {
                        if (activeVideo.paused) {
                            console.log('Hero video autoplay: Video was paused after play() - browser policy');
                            // Try to play again after user interaction
                            document.addEventListener('touchstart', function retryPlay() {
                                activeVideo.play().catch(e => console.log('Retry after touch error:', e));
                                document.removeEventListener('touchstart', retryPlay);
                            }, { once: true });
                        } else {
                            console.log('Hero video autoplay: Success - video is playing');
                        }
                    }, 100);
                }).catch(err => {
                    console.log('Hero video autoplay error:', err);
                    // Try again after small delay
                    setTimeout(() => {
                        activeVideo.play().catch(e => {
                            console.log('Hero video autoplay retry error:', e);
                        });
                    }, 500);
                });
            } else {
                // Wait for video to load
                activeVideo.addEventListener('canplay', attemptPlay, { once: true });
                activeVideo.load(); // Force start loading
            }
        }
        
        attemptPlay();
    };
    
    // Initialize video on load (set to first frame)
    heroVideos.forEach(video => {
        video.addEventListener('loadeddata', () => {
            video.currentTime = 0;
            video.pause();
        });
    });
}

// Function to handle video on mouse hover
function initVideoHover() {
    // Find all cards with video
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card) => {
        const video = card.querySelector('.phone-video:not(.hero-phone-video)');
        const description = card.querySelector('.feature-description');
        
        if (!video || !description) return;
        
        // Set video to first frame on load
        video.addEventListener('loadeddata', () => {
            video.currentTime = 0;
            video.pause();
        });
        
        // Find preloader for this video
        const preloader = card.querySelector('.video-preloader');
        
        // On mouse enter card
        card.addEventListener('mouseenter', () => {
            // If video not loaded, show loader
            if (video.readyState < 2 && preloader) {
                preloader.classList.add('active');
            }
            
            // Handler to hide loader when video loads
            const handleLoaded = () => {
                // Check that video is actually loaded before hiding loader
                if (video.readyState >= 2 && preloader) {
                    preloader.classList.remove('active');
                }
            };
            
            // Add handlers for all load events
            video.addEventListener('canplay', handleLoaded, { once: true });
            video.addEventListener('loadeddata', handleLoaded, { once: true });
            video.addEventListener('loadedmetadata', handleLoaded, { once: true });
            
            // Play video
            video.play().then(() => {
                // Hide loader after successful start if video loaded
                if (preloader && video.readyState >= 2) {
                    preloader.classList.remove('active');
                }
            }).catch(err => {
                console.log('Video play error:', err);
            });
            // Hide description (via CSS class or directly)
            description.style.opacity = '0';
            description.style.visibility = 'hidden';
        });
        
        // On mouse leave card
        card.addEventListener('mouseleave', () => {
            // Stop video on current frame (dont reset to beginning!)
            video.pause();
            // Show description
            description.style.opacity = '1';
            description.style.visibility = 'visible';
        });
    });
}

// Function for mobile carousel in features section
function initFeaturesCarousel() {
    const wrapper = document.querySelector('.features-carousel-wrapper');
    const slides = document.querySelectorAll('.features-grid .feature-card');
    const dots = document.querySelectorAll('.features-dots .feature-dot');

    if (!wrapper || !slides.length || !dots.length) return;

    function isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    function updateDots(index) {
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[index]) dots[index].classList.add('active');
    }

    function getActiveSlideIndex() {
        if (!isMobile()) return 0;
        
        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
        
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        slides.forEach((slide, index) => {
            const slideRect = slide.getBoundingClientRect();
            const slideCenter = slideRect.left + slideRect.width / 2;
            const distance = Math.abs(slideCenter - wrapperCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });
        
        return closestIndex;
    }

    function goToIndex(index) {
        if (!isMobile()) return;
        
        const targetIndex = Math.max(0, Math.min(slides.length - 1, index));
        const targetSlide = slides[targetIndex];
        
        if (targetSlide) {
            wrapper.scrollTo({
                left: targetSlide.offsetLeft - wrapper.offsetLeft,
                behavior: 'smooth'
            });
        }
    }

    // Dot click handlers
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = Number(dot.getAttribute('data-index'));
            if (!Number.isNaN(index)) {
                goToIndex(index);
                // Play video after transition (with small delay for scroll completion)
                setTimeout(() => {
                    playVideoForActiveSlide();
                }, 400);
            }
        });
    });

    // Function to control video on mobile
    let currentPlayingVideo = null;
    
    function playVideoForActiveSlide() {
        if (!isMobile()) return;
        
        const activeIndex = getActiveSlideIndex();
        const activeSlide = slides[activeIndex];
        
        if (!activeSlide) return;
        
        // Stop all videos except active
        slides.forEach((slide, index) => {
            if (index !== activeIndex) {
                const video = slide.querySelector('.phone-video:not(.hero-phone-video)');
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
        
        // Play video in active card
        const video = activeSlide.querySelector('.phone-video:not(.hero-phone-video)');
        if (!video) return;
        
        if (currentPlayingVideo !== activeSlide) {
            // Find loader for this video
            const preloader = activeSlide.querySelector('.video-preloader');
            
            // Ensure video is loaded before playing
            function attemptPlay() {
                if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                    // Ensure video has required attributes for autoplay
                    if (!video.muted) {
                        video.muted = true;
                    }
                    video.setAttribute('playsinline', '');
                    
                    // Hide loader before start if video loaded
                    if (preloader) {
                        preloader.classList.remove('active');
                    }
                    
                    video.play().then(() => {
                        // Check if video is actually playing
                        setTimeout(() => {
                            if (video.paused) {
                                console.log('Features video autoplay: Video was paused after play() - browser policy');
                            } else {
                                console.log('Features video autoplay: Success for slide', activeIndex);
                                currentPlayingVideo = activeSlide;
                                // Ensure loader is hidden
                                if (preloader) {
                                    preloader.classList.remove('active');
                                }
                            }
                        }, 100);
                    }).catch(err => {
                        console.log('Features video play error:', err);
                        // Try again after small delay
                        setTimeout(() => {
                            video.play().then(() => {
                                currentPlayingVideo = activeSlide;
                                if (preloader) {
                                    preloader.classList.remove('active');
                                }
                            }).catch(e => {
                                console.log('Features video autoplay retry error:', e);
                            });
                        }, 500);
                    });
                } else {
                    // If video not loaded, show loader immediately
                    if (preloader) {
                        preloader.classList.add('active');
                    }
                    
                    // Handlers to hide loader when video loads
                    const handleLoaded = () => {
                        // Check that video is actually loaded before hiding loader
                        if (video.readyState >= 2) {
                            if (preloader) {
                                preloader.classList.remove('active');
                            }
                            // Play video only if loaded
                            attemptPlay();
                        }
                    };
                    
                    // Add handlers for all load events
                    video.addEventListener('canplay', handleLoaded, { once: true });
                    video.addEventListener('loadeddata', handleLoaded, { once: true });
                    video.addEventListener('loadedmetadata', handleLoaded, { once: true });
                    
                    // Also check readyState periodically in case events didnt fire
                    const checkInterval = setInterval(() => {
                        if (video.readyState >= 2) {
                            clearInterval(checkInterval);
                            handleLoaded();
                        }
                    }, 100);
                    
                    // Clear interval after 10 seconds to avoid infinite checking
                    setTimeout(() => clearInterval(checkInterval), 10000);
                    
                    // Force start loading
                    video.load();
                }
            }
            
            attemptPlay();
        }
    }

    // Sync dots on scroll
    let scrollTimeout;
    wrapper.addEventListener('scroll', () => {
        if (!isMobile()) return;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const activeIndex = getActiveSlideIndex();
            updateDots(activeIndex);
            playVideoForActiveSlide();
        }, 100);
    }, { passive: true });

    // Initialize on load
    if (isMobile()) {
        updateDots(0);
        // Show loader for first slide if video not loaded
        const firstSlide = slides[0];
        if (firstSlide) {
            const firstVideo = firstSlide.querySelector('.phone-video:not(.hero-phone-video)');
            const firstPreloader = firstSlide.querySelector('.video-preloader');
            if (firstVideo && firstPreloader) {
                if (firstVideo.readyState < 2) {
                    // Video not loaded, show loader immediately
                    firstPreloader.classList.add('active');
                }
            }
        }
        // Play first video on load
        setTimeout(() => {
            playVideoForActiveSlide();
        }, 300);
    }
}

// Function to initialize video preloaders
function initVideoPreloaders() {
    // Reduce delay for mobile version for quick loader display
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const PRELOADER_DELAY = 0;
    
    // Find all phone videos
    const phoneVideos = document.querySelectorAll('.hero-frame-video, .phone-video');
    
    phoneVideos.forEach(video => {
        // Find preloader for this video
        const preloader = video.parentElement.querySelector('.video-preloader');
        if (!preloader) return;
        
        let showTimer = null;
        let isLoaded = false;
        let isError = false;
        
        // Function to hide preloader
        function hidePreloader() {
            if (showTimer) {
                clearTimeout(showTimer);
                showTimer = null;
            }
            preloader.classList.remove('active');
            isLoaded = true;
        }
        
        // Function to show preloader (immediately)
        function showPreloader() {
            if (isLoaded || isError) return;
            
            // Show loader immediately, no delay
            preloader.classList.add('active');
        }
        
        // Function to reset state
        function resetPreloader() {
            if (showTimer) {
                clearTimeout(showTimer);
                showTimer = null;
            }
            isLoaded = false;
            isError = false;
            preloader.classList.remove('active');
        }
        
        // Video load event handlers
        const handleLoaded = () => {
            hidePreloader();
        };
        
        const handleError = () => {
            isError = true;
            hidePreloader();
            console.log('Video loading error:', video.src || video.querySelector('source')?.src);
        };
        
        // Add event handlers
        video.addEventListener('loadeddata', handleLoaded);
        video.addEventListener('canplay', handleLoaded);
        video.addEventListener('loadedmetadata', handleLoaded);
        video.addEventListener('error', handleError);
        
        // Check if video already loaded
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            hidePreloader();
        } else {
            // If video not loaded yet, start countdown to show preloader
            showPreloader();
        }
        
        // Handle video source change (for dynamic loading)
        const source = video.querySelector('source');
        if (source) {
            const observer = new MutationObserver(() => {
                resetPreloader();
                if (video.readyState < 2) {
                    showPreloader();
                }
            });
            
            observer.observe(source, {
                attributes: true,
                attributeFilter: ['src']
            });
        }
        
        // Handle src change on video element itself
        const videoObserver = new MutationObserver(() => {
            resetPreloader();
            if (video.readyState < 2) {
                showPreloader();
            }
        });
        
        videoObserver.observe(video, {
            attributes: true,
            attributeFilter: ['src']
        });
    });
}

// Initialize on page load (once)
let didInit = false;
function initAll() {
    if (didInit) return;
    didInit = true;
    initScrollAnimation();
    initTabSwitcher();
    initVideoHover();
    initFeaturesCarousel();
    initHeroVideoControl();
    initVideoPreloaders();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
} else {
    initAll();
}
