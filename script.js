// Глобальная переменная для функции автозапуска видео
let triggerHeroVideoAutoPlay = null;

// Функция для обработки скролла и анимации декоративных элементов
function initScrollAnimation() {
    const heroSection = document.querySelector('.hero-section');
    const heroContainer = document.querySelector('.hero-container');
    // Важно: .phone-mockup теперь включает Tabs, поэтому центр нужно брать по области телефона
    // (phones-container), иначе при некоторых ресайзах декор не попадает строго "за телефон".
    const phoneTarget = document.querySelector('.phones-container')
        || document.querySelector('.phone-frame.active')
        || document.querySelector('.phone-frame')
        || document.querySelector('.phone-mockup');
    
    // Элементы по рядам
    const row1 = [
        document.querySelector('.hero-decor-1'), // Чеснок
        document.querySelector('.hero-decor-3')   // Перец
    ];
    
    const row2 = [
        document.querySelector('.hero-decor-2'), // Оливковое масло
        document.querySelector('.hero-decor-4')  // Сыр
    ];
    
    const row3 = [
        document.querySelector('.hero-decor-5'), // Паста
        document.querySelector('.hero-decor-6')  // Цукини
    ];
    
    if (!heroSection || !heroContainer || !phoneTarget) return;
    
    // Вычисляем центр телефона и применяем смещения для всех элементов
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
                
                // 2-й ряд (оливки и сыр) на 6px ниже конца текста описания
                const row2Top = Math.round(descBottom -30);
                const rowGap = 72; // для 3-го ряда
                const row3Top = row2Top + rowGap;

                heroContainer.style.setProperty('--decor-row1-top', `${row1Top}px`);
                heroContainer.style.setProperty('--decor-row2-top', `${row2Top}px`);
                heroContainer.style.setProperty('--decor-row3-top', `${row3Top}px`);

                // "Каскад" по ширине: 2-й ряд уже на 20%, 3-й ещё на 20%.
                // Реализуем через симметричный inset слева/справа.
                const base = 20;
                const span = Math.max(0, containerRect.width - base * 2);
                const inset2 = Math.round(span * 0.10); // сужаем на 20% => по 10% с каждой стороны
                const inset3 = Math.round(span * 0.20); // ещё на 20% => по 20% с каждой стороны

                heroContainer.style.setProperty('--decor-inset-1', `0px`);
                heroContainer.style.setProperty('--decor-inset-2', `${inset2}px`);
                heroContainer.style.setProperty('--decor-inset-3', `${inset3}px`);
            }
        }
        
        // Центр телефона относительно контейнера
        const phoneCenterX = phoneRect.left - containerRect.left + phoneRect.width / 2;
        const phoneCenterY = phoneRect.top - containerRect.top + phoneRect.height / 2;
        
        // Применяем смещения ко всем элементам
        const allElements = [...row1, ...row2, ...row3];
        
        allElements.forEach((el) => {
            if (!el) return;
            
            const elRect = el.getBoundingClientRect();
            
            // Текущий центр элемента относительно контейнера
            const elCenterX = elRect.left - containerRect.left + elRect.width / 2;
            const elCenterY = elRect.top - containerRect.top + elRect.height / 2;
            
            // Смещение к центру телефона
            const offsetX = phoneCenterX - elCenterX;
            const offsetY = phoneCenterY - elCenterY;
            
            // Применяем через CSS переменные
            el.style.setProperty('--target-x', `${offsetX}px`);
            el.style.setProperty('--target-y', `${offsetY}px`);
        });
    }
    
    // Вызываем при загрузке и при ресайзе
    calculateAndApplyOffsets();
    window.addEventListener('resize', calculateAndApplyOffsets);
    
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const heroSectionTop = heroSection.offsetTop;
        const heroSectionHeight = heroSection.offsetHeight;
        const phoneTop = phoneTarget.getBoundingClientRect().top + scrollTop;
        const scrollProgress = scrollTop - heroSectionTop;
        
        // Вычисляем относительный прогресс скролла (0-1)
        const maxScroll = heroSectionHeight;
        const scrollRatio = Math.max(0, Math.min(1, scrollProgress / maxScroll));
        
        // Проверяем, находимся ли мы в пределах hero-section
        if (scrollProgress < 0 || scrollProgress > heroSectionHeight) {
            // Если вышли за пределы секции, сбрасываем все классы
            [...row1, ...row2, ...row3].forEach(el => {
                if (el) el.classList.remove('hide-behind-phone');
            });
            return;
        }
        
        // Пороги скролла для каждого ряда (в процентах от высоты секции)
        // Анимация начинается сразу при начале скролла
        const threshold1 = 0.01; // 1% прокрутки секции - начинается сразу
        const threshold2 = 0.05; // 5% прокрутки секции
        const threshold3 = 0.10; // 10% прокрутки секции
        
        // Ряд 1: Чеснок и Перец - прячутся первыми
        if (scrollRatio >= threshold1) {
            row1.forEach(el => {
                if (el) el.classList.add('hide-behind-phone');
            });
        } else {
            row1.forEach(el => {
                if (el) el.classList.remove('hide-behind-phone');
            });
        }
        
        // Ряд 2: Оливковое масло и Сыр - прячутся вторыми
        if (scrollRatio >= threshold2) {
            row2.forEach(el => {
                if (el) el.classList.add('hide-behind-phone');
            });
        } else {
            row2.forEach(el => {
                if (el) el.classList.remove('hide-behind-phone');
            });
        }
        
        // Ряд 3: Паста и Цукини - прячутся последними
        if (scrollRatio >= threshold3) {
            row3.forEach(el => {
                if (el) el.classList.add('hide-behind-phone');
            });
            // Автозапуск первого видео когда row3 прячется
            if (triggerHeroVideoAutoPlay) {
                triggerHeroVideoAutoPlay();
            }
        } else {
            row3.forEach(el => {
                if (el) el.classList.remove('hide-behind-phone');
            });
        }
    }
    
    // Используем requestAnimationFrame для плавной анимации
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
    
    // Слушаем события скролла
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Вызываем сразу для начального состояния
    handleScroll();
}

// Функция для переключения табов и анимации телефонов
function initTabSwitcher() {
    const tabs = document.querySelectorAll('.hero-tab');
    const phones = document.querySelectorAll('.phone-slide');
    const phonesContainer = document.querySelector('.phones-container');
    
    if (!tabs.length || !phones.length) return;
    
    let isAnimating = false;
    const tabOrder = ['voice', 'snap', 'text'];
    
    // Проверка, мобильная ли версия
    function isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }
    
    // Инициализация: устанавливаем первый таб активным, если нет активного
    function initializeActiveTab() {
        const activeTab = Array.from(tabs).find(t => t.classList.contains('active'));
        const activePhone = Array.from(phones).find(p => p.classList.contains('active'));
        
        if (!activeTab) {
            // Если нет активного таба, активируем первый (snap по умолчанию в HTML)
            const defaultTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === 'snap') || tabs[0];
            if (defaultTab) {
                defaultTab.classList.add('active');
                defaultTab.setAttribute('data-state', 'active');
            }
        }
        
        if (!activePhone) {
            // Если нет активного телефона, активируем соответствующий
            const activeTabName = (Array.from(tabs).find(t => t.classList.contains('active')) || {}).getAttribute('data-tab') || 'snap';
            const defaultPhone = Array.from(phones).find(p => p.getAttribute('data-tab') === activeTabName);
            if (defaultPhone) {
                defaultPhone.classList.add('active');
            }
        }
        
        // На мобильных: скроллим к активному телефону
        if (isMobile() && phonesContainer) {
            const activeTabName = (Array.from(tabs).find(t => t.classList.contains('active')) || {}).getAttribute('data-tab') || 'snap';
            const activePhone = Array.from(phones).find(p => p.getAttribute('data-tab') === activeTabName);
            if (activePhone) {
                // Небольшая задержка для правильного позиционирования элементов
                setTimeout(() => {
                    phonesContainer.scrollTo({
                        left: activePhone.offsetLeft - phonesContainer.offsetLeft,
                        behavior: 'auto' // без анимации при инициализации
                    });
                    // Обновляем активный класс у телефонов
                    phones.forEach(p => p.classList.remove('active'));
                    activePhone.classList.add('active');
                    // Инициализируем opacity
                    if (window.updatePhonesOpacity) {
                        window.updatePhonesOpacity();
                    }
                }, 100);
            }
        }
    }
    
    // Получить индекс активного телефона на основе скролла (для мобильных)
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
    
    
    // Обновить активный таб на основе активного телефона
    function updateActiveTabFromPhone() {
        if (!isMobile()) return;
        
        const activeIndex = getActivePhoneIndexFromScroll();
        if (activeIndex === -1) return;
        
        const activePhone = phones[activeIndex];
        if (!activePhone) return;
        
        const activeTabName = activePhone.getAttribute('data-tab');
        const activeTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === activeTabName);
        
        if (activeTab && !activeTab.classList.contains('active')) {
            // Убираем активный класс со всех табов
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('data-state', 'default');
            });
            
            // Добавляем активный класс к выбранному табу
            activeTab.classList.add('active');
            activeTab.setAttribute('data-state', 'active');
            
            // Переключаем видео
            if (window.playActiveTabVideo) {
                window.playActiveTabVideo();
            }
        }
    }
    
    // Функция для переключения на конкретный таб
    function switchToTab(tabName) {
        // Предотвращаем множественные переключения во время анимации
        if (isAnimating) return;
        
        // Находим таб по имени
        const targetTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === tabName);
        if (!targetTab) return;
        
        // Находим текущий активный таб
        const currentActiveTab = Array.from(tabs).find(t => t.classList.contains('active'));
        
        // Проверяем, не выбран ли уже этот таб
        if (currentActiveTab && currentActiveTab.getAttribute('data-tab') === tabName) return;
        
        isAnimating = true;
        
        // Убираем активный класс со всех табов (сразу)
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('data-state', 'default');
        });
        
        // Находим целевой телефон
        const targetPhone = document.querySelector(`.phone-slide[data-tab="${tabName}"]`);
        
        if (isMobile() && phonesContainer && targetPhone) {
            // На мобильных: используем скролл
            phonesContainer.scrollTo({
                left: targetPhone.offsetLeft - phonesContainer.offsetLeft,
                behavior: 'smooth'
            });
            
            // Обновляем активный класс у телефонов
            phones.forEach(p => p.classList.remove('active'));
            targetPhone.classList.add('active');
            
            // Обновляем opacity после скролла
            setTimeout(() => {
                if (window.updatePhonesOpacity) {
                    window.updatePhonesOpacity();
                }
            }, 100);
            
            // Активируем таб и переключаем видео после завершения анимации
            setTimeout(() => {
                // Активируем таб только когда телефон полностью появился
                targetTab.classList.add('active');
                targetTab.setAttribute('data-state', 'active');
                
                if (window.playActiveTabVideo) {
                    window.playActiveTabVideo();
                }
                isAnimating = false;
            }, 250);
        } else {
            // На десктопе: используем старый механизм с классами
            const currentActivePhone = document.querySelector('.phone-slide.active');
            
            if (currentActivePhone && targetPhone && currentActivePhone !== targetPhone) {
                // Очищаем все классы анимации у всех телефонов
                phones.forEach(p => {
                    p.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
                });
                
                // Убеждаемся, что новый телефон не имеет активного класса перед анимацией
                targetPhone.classList.remove('active');
                
                // Определяем направление анимации
                const currentIndex = tabOrder.indexOf(currentActivePhone.getAttribute('data-tab'));
                const targetIndex = tabOrder.indexOf(tabName);
                
                if (targetIndex > currentIndex) {
                    // Переход вправо: текущий уходит влево, новый приходит справа
                    currentActivePhone.classList.remove('active');
                    currentActivePhone.classList.add('slide-out-left');
                    targetPhone.classList.add('slide-in-right');
                } else {
                    // Переход влево: текущий уходит вправо, новый приходит слева
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
                    
                    // Активируем таб только когда телефон полностью появился
                    targetTab.classList.add('active');
                    targetTab.setAttribute('data-state', 'active');
                    
                    isAnimating = false;
                    // Переключаем видео после завершения анимации
                    if (window.playActiveTabVideo) {
                        window.playActiveTabVideo();
                    }
                }, 320);
            } else {
                isAnimating = false;
            }
        }
    }
    
    // Функция для переключения видео в активном табе (доступна глобально)
    window.playActiveTabVideo = function() {
        const allPhones = document.querySelectorAll('.phone-slide');
        const container = document.querySelector('.phones-container');
        const isMobileView = window.matchMedia('(max-width: 768px)').matches;
        
        let activePhone;
        
        if (isMobileView && container && allPhones.length > 0) {
            // На мобильных: находим активный телефон через скролл
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
            // На десктопе: используем класс active
            activePhone = document.querySelector('.phone-slide.active');
        }
        
        if (!activePhone) return;
        
        const activeVideo = activePhone.querySelector('.hero-frame-video');
        const allHeroVideos = document.querySelectorAll('.hero-frame-video');
        
        if (activeVideo && allHeroVideos.length > 0) {
            // Останавливаем все видео
            allHeroVideos.forEach(video => {
                if (video !== activeVideo) {
                    video.pause();
                    video.currentTime = 0;
                }
            });
            // Запускаем активное видео
            activeVideo.play().catch(err => {
                console.log('Hero video play error:', err);
            });
            
            // Сбрасываем прелодер для активного видео, если оно еще не загружено
            const activePreloader = activePhone.querySelector('.video-preloader');
            if (activePreloader && activeVideo.readyState < 2) {
                // Если видео еще не загружено, показываем прелодер с задержкой
                setTimeout(() => {
                    if (activeVideo.readyState < 2 && !activePreloader.classList.contains('active')) {
                        activePreloader.classList.add('active');
                    }
                }, 200);
            }
        }
    };
    
    // Обработчики кликов на табы
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchToTab(tabName);
        });
    });
    
    // Функция для плавного изменения opacity телефонов при скролле
    function updatePhonesOpacity() {
        if (!isMobile() || !phonesContainer) return;
        
        const containerRect = phonesContainer.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        const containerWidth = containerRect.width;
        
        // Порог для полного исчезновения (когда телефон полностью за пределами видимости)
        // Используем 35% ширины контейнера для более плавного перехода
        const fadeThreshold = containerWidth * 0.35;
        
        phones.forEach((phone) => {
            const phoneRect = phone.getBoundingClientRect();
            const phoneCenter = phoneRect.left + phoneRect.width / 2;
            
            // Расстояние от центра телефона до центра контейнера
            const distance = Math.abs(phoneCenter - containerCenter);
            
            // Вычисляем opacity: 1 когда телефон в центре, 0 когда далеко
            // Нормализуем расстояние
            let normalizedDistance = Math.min(1, distance / fadeThreshold);
            
            // Используем кубическую кривую для более плавного fade (ease-out)
            // Это создает более естественный переход
            let opacity = 1 - normalizedDistance;
            opacity = opacity * opacity * opacity; // Кубическая кривая
            
            // Ограничиваем opacity от 0 до 1
            opacity = Math.max(0, Math.min(1, opacity));
            
            // Применяем opacity
            phone.style.opacity = opacity;
        });
    }
    
    // Делаем функцию доступной глобально для вызова из других мест
    window.updatePhonesOpacity = updatePhonesOpacity;
    
    // Обработчик скролла для синхронизации табов и плавного изменения opacity (только на мобильных)
    if (phonesContainer && isMobile()) {
        let scrollTimeout;
        let scrollAnimationFrame = null;
        
        phonesContainer.addEventListener('scroll', () => {
            // Обновляем opacity при каждом скролле (используем requestAnimationFrame для плавности)
            if (scrollAnimationFrame) {
                cancelAnimationFrame(scrollAnimationFrame);
            }
            scrollAnimationFrame = requestAnimationFrame(() => {
                updatePhonesOpacity();
            });
            
            // Обновляем табы с небольшой задержкой
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updateActiveTabFromPhone();
            }, 100);
        }, { passive: true });
        
        // Инициализируем opacity при загрузке
        setTimeout(() => {
            updatePhonesOpacity();
        }, 150);
    }
    
    // Обработчики свайпа для десктопной версии (если нужно)
    if (phonesContainer && !isMobile()) {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        const minSwipeDistance = 50; // Минимальное расстояние для свайпа
        
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
            
            // Проверяем, что это горизонтальный свайп (а не вертикальный скролл)
            if (Math.abs(swipeDistanceY) > Math.abs(swipeDistanceX)) return;
            
            // Проверяем, достаточно ли длинный свайп
            if (Math.abs(swipeDistanceX) < minSwipeDistance) return;
            
            // Находим текущий активный таб
            const activeTab = Array.from(tabs).find(t => t.classList.contains('active'));
            if (!activeTab) return;
            
            const currentTabName = activeTab.getAttribute('data-tab');
            const currentIndex = tabOrder.indexOf(currentTabName);
            
            if (currentIndex === -1) return;
            
            // Определяем направление свайпа
            if (swipeDistanceX > 0) {
                // Свайп вправо (пальцем слева направо) → показываем ПРЕДЫДУЩИЙ таб
                if (currentIndex > 0) {
                    const prevIndex = currentIndex - 1;
                    switchToTab(tabOrder[prevIndex]);
                }
            } else {
                // Свайп влево (пальцем справа налево) → показываем СЛЕДУЮЩИЙ таб
                if (currentIndex < tabOrder.length - 1) {
                    const nextIndex = currentIndex + 1;
                    switchToTab(tabOrder[nextIndex]);
                }
            }
        }
    }
    
    // Инициализация активного таба при загрузке
    initializeActiveTab();
    
    // Инициализация управления видео
    initHeroVideoControl();
}

// Функция для управления видео в hero-секции
function initHeroVideoControl() {
    const heroVideos = document.querySelectorAll('.hero-frame-video');
    let hasAutoPlayed = false;
    
    // Функция для автозапуска первого видео (вызывается при скролле)
    triggerHeroVideoAutoPlay = function() {
        if (hasAutoPlayed) return;
        hasAutoPlayed = true;
        
        // Находим активный телефон и его видео
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
        
        // Останавливаем все остальные видео
        heroVideos.forEach(video => {
            if (video !== activeVideo) {
                video.pause();
                video.currentTime = 0;
            }
        });
        
        // Убеждаемся, что видео загружено перед запуском
        function attemptPlay() {
            if (activeVideo.readyState >= 2) { // HAVE_CURRENT_DATA или выше
                // Убеждаемся, что видео имеет необходимые атрибуты для автозапуска
                if (!activeVideo.muted) {
                    activeVideo.muted = true;
                }
                activeVideo.setAttribute('playsinline', '');
                
                activeVideo.play().then(() => {
                    // Проверяем, действительно ли видео воспроизводится
                    setTimeout(() => {
                        if (activeVideo.paused) {
                            console.log('Hero video autoplay: Video was paused after play() - browser policy');
                            // Пробуем запустить еще раз после взаимодействия пользователя
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
                    // Пробуем еще раз после небольшой задержки
                    setTimeout(() => {
                        activeVideo.play().catch(e => {
                            console.log('Hero video autoplay retry error:', e);
                        });
                    }, 500);
                });
            } else {
                // Ждем загрузки видео
                activeVideo.addEventListener('canplay', attemptPlay, { once: true });
                activeVideo.load(); // Принудительно начинаем загрузку
            }
        }
        
        attemptPlay();
    };
    
    // Инициализация видео при загрузке (устанавливаем на первый кадр)
    heroVideos.forEach(video => {
        video.addEventListener('loadeddata', () => {
            video.currentTime = 0;
            video.pause();
        });
    });
}

// Функция для обработки видео при наведении мыши
function initVideoHover() {
    // Находим все карточки с видео
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card) => {
        const video = card.querySelector('.phone-video:not(.hero-phone-video)');
        const description = card.querySelector('.feature-description');
        
        if (!video || !description) return;
        
        // Устанавливаем видео на первый кадр при загрузке
        video.addEventListener('loadeddata', () => {
            video.currentTime = 0;
            video.pause();
        });
        
        // Находим прелодер для этого видео
        const preloader = card.querySelector('.video-preloader');
        
        // При наведении мыши на карточку
        card.addEventListener('mouseenter', () => {
            // Если видео не загружено, показываем лоадер
            if (video.readyState < 2 && preloader) {
                preloader.classList.add('active');
            }
            
            // Обработчик для скрытия лоадера когда видео загрузится
            const handleLoaded = () => {
                // Проверяем, что видео действительно загружено перед скрытием лоадера
                if (video.readyState >= 2 && preloader) {
                    preloader.classList.remove('active');
                }
            };
            
            // Добавляем обработчики для всех событий загрузки
            video.addEventListener('canplay', handleLoaded, { once: true });
            video.addEventListener('loadeddata', handleLoaded, { once: true });
            video.addEventListener('loadedmetadata', handleLoaded, { once: true });
            
            // Проигрываем видео
            video.play().then(() => {
                // Скрываем лоадер после успешного запуска, если видео загружено
                if (preloader && video.readyState >= 2) {
                    preloader.classList.remove('active');
                }
            }).catch(err => {
                console.log('Video play error:', err);
            });
            // Скрываем описание (через CSS класс или напрямую)
            description.style.opacity = '0';
            description.style.visibility = 'hidden';
        });
        
        // При убирании мыши с карточки
        card.addEventListener('mouseleave', () => {
            // Останавливаем видео на текущем кадре (не возвращаем к началу!)
            video.pause();
            // Показываем описание
            description.style.opacity = '1';
            description.style.visibility = 'visible';
        });
    });
}

// Функция для мобильной карусели в блоке features
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

    // Обработчики кликов на dots
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = Number(dot.getAttribute('data-index'));
            if (!Number.isNaN(index)) {
                goToIndex(index);
                // Запускаем видео после перехода (с небольшой задержкой для завершения скролла)
                setTimeout(() => {
                    playVideoForActiveSlide();
                }, 400);
            }
        });
    });

    // Функция для управления видео на мобильных
    let currentPlayingVideo = null;
    
    function playVideoForActiveSlide() {
        if (!isMobile()) return;
        
        const activeIndex = getActiveSlideIndex();
        const activeSlide = slides[activeIndex];
        
        if (!activeSlide) return;
        
        // Останавливаем все видео, кроме активного
        slides.forEach((slide, index) => {
            if (index !== activeIndex) {
                const video = slide.querySelector('.phone-video:not(.hero-phone-video)');
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
        
        // Запускаем видео в активной карточке
        const video = activeSlide.querySelector('.phone-video:not(.hero-phone-video)');
        if (!video) return;
        
        if (currentPlayingVideo !== activeSlide) {
            // Находим лоадер для этого видео
            const preloader = activeSlide.querySelector('.video-preloader');
            
            // Убеждаемся, что видео загружено перед запуском
            function attemptPlay() {
                if (video.readyState >= 2) { // HAVE_CURRENT_DATA или выше
                    // Убеждаемся, что видео имеет необходимые атрибуты для автозапуска
                    if (!video.muted) {
                        video.muted = true;
                    }
                    video.setAttribute('playsinline', '');
                    
                    // Скрываем лоадер перед запуском, если видео загружено
                    if (preloader) {
                        preloader.classList.remove('active');
                    }
                    
                    video.play().then(() => {
                        // Проверяем, действительно ли видео воспроизводится
                        setTimeout(() => {
                            if (video.paused) {
                                console.log('Features video autoplay: Video was paused after play() - browser policy');
                            } else {
                                console.log('Features video autoplay: Success for slide', activeIndex);
                                currentPlayingVideo = activeSlide;
                                // Убеждаемся, что лоадер скрыт
                                if (preloader) {
                                    preloader.classList.remove('active');
                                }
                            }
                        }, 100);
                    }).catch(err => {
                        console.log('Features video play error:', err);
                        // Пробуем еще раз после небольшой задержки
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
                    // Если видео не загружено, показываем лоадер сразу
                    if (preloader) {
                        preloader.classList.add('active');
                    }
                    
                    // Обработчики для скрытия лоадера когда видео загрузится
                    const handleLoaded = () => {
                        // Проверяем, что видео действительно загружено перед скрытием лоадера
                        if (video.readyState >= 2) {
                            if (preloader) {
                                preloader.classList.remove('active');
                            }
                            // Запускаем видео только если оно загружено
                            attemptPlay();
                        }
                    };
                    
                    // Добавляем обработчики для всех событий загрузки
                    video.addEventListener('canplay', handleLoaded, { once: true });
                    video.addEventListener('loadeddata', handleLoaded, { once: true });
                    video.addEventListener('loadedmetadata', handleLoaded, { once: true });
                    
                    // Также проверяем readyState периодически на случай, если события не сработали
                    const checkInterval = setInterval(() => {
                        if (video.readyState >= 2) {
                            clearInterval(checkInterval);
                            handleLoaded();
                        }
                    }, 100);
                    
                    // Очищаем интервал через 10 секунд, чтобы не проверять бесконечно
                    setTimeout(() => clearInterval(checkInterval), 10000);
                    
                    // Принудительно начинаем загрузку
                    video.load();
                }
            }
            
            attemptPlay();
        }
    }

    // Синхронизация dots при скролле
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

    // Инициализация при загрузке
    if (isMobile()) {
        updateDots(0);
        // Показываем лоадер для первого слайда, если видео не загружено
        const firstSlide = slides[0];
        if (firstSlide) {
            const firstVideo = firstSlide.querySelector('.phone-video:not(.hero-phone-video)');
            const firstPreloader = firstSlide.querySelector('.video-preloader');
            if (firstVideo && firstPreloader) {
                if (firstVideo.readyState < 2) {
                    // Видео не загружено, показываем лоадер сразу
                    firstPreloader.classList.add('active');
                }
            }
        }
        // Запускаем первое видео при загрузке
        setTimeout(() => {
            playVideoForActiveSlide();
        }, 300);
    }
}

// Функция для инициализации прелодеров видео
function initVideoPreloaders() {
    // Уменьшаем задержку для мобильной версии для быстрого показа лоадера
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const PRELOADER_DELAY = 0;
    
    // Находим все видео телефонов
    const phoneVideos = document.querySelectorAll('.hero-frame-video, .phone-video');
    
    phoneVideos.forEach(video => {
        // Находим прелодер для этого видео
        const preloader = video.parentElement.querySelector('.video-preloader');
        if (!preloader) return;
        
        let showTimer = null;
        let isLoaded = false;
        let isError = false;
        
        // Функция для скрытия прелодера
        function hidePreloader() {
            if (showTimer) {
                clearTimeout(showTimer);
                showTimer = null;
            }
            preloader.classList.remove('active');
            isLoaded = true;
        }
        
        // Функция для показа прелодера (немедленно)
        function showPreloader() {
            if (isLoaded || isError) return;
            
            // Показываем лоадер сразу, без задержки
            preloader.classList.add('active');
        }
        
        // Функция для сброса состояния
        function resetPreloader() {
            if (showTimer) {
                clearTimeout(showTimer);
                showTimer = null;
            }
            isLoaded = false;
            isError = false;
            preloader.classList.remove('active');
        }
        
        // Обработчики событий загрузки видео
        const handleLoaded = () => {
            hidePreloader();
        };
        
        const handleError = () => {
            isError = true;
            hidePreloader();
            console.log('Video loading error:', video.src || video.querySelector('source')?.src);
        };
        
        // Добавляем обработчики событий
        video.addEventListener('loadeddata', handleLoaded);
        video.addEventListener('canplay', handleLoaded);
        video.addEventListener('loadedmetadata', handleLoaded);
        video.addEventListener('error', handleError);
        
        // Проверяем, не загружено ли видео уже
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA или выше
            hidePreloader();
        } else {
            // Если видео еще не загружено, начинаем отсчет для показа прелодера
            showPreloader();
        }
        
        // Обработка смены источника видео (для динамической загрузки)
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
        
        // Обработка смены src у самого video элемента
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

// Инициализация при загрузке страницы (один раз)
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
