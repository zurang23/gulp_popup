// 팝업 옵션 설정
const popupOption = {
    wrapperClassName: 'wrap-layer-popup', // 팝업 wrapper class name
    dimmed: true, // 팝업 딤드 유무
    dimmedClassName: 'popup-dimmed', // 팝업 딤드 class name
    dimmedPrevClassName: 'prev-popup', // 팝업 위 팝업이 뜰 경우 이전 팝업에 추가 되는 class name
    dimmedClickClose: true, // 팝업 딤드 클릭 시 팝업 닫기 기능
    scrollLock: true, // 팝업 오픈 시 body 영역 스크롤 lock 기능
    scrollLockClassName: 'scroll-lock', // body scroll lock class name
    openClassName: 'popup-open', // 팝업 활성화 시 추가 되는 class name
    titleClassName: 'wrap-layer-popup-title', // 팝업 활성화 시 포커스 될 타이틀 class name
    closeBtnClassName: 'btn-layer-close', // 팝업 닫기 버튼 class name (팝업 마크업 마지막에 들어가는 닫기 버튼)
};

// 전역 변수
let focusElement = [];
let cookieCheckValue = [];
let cookieData;
let popupDepth = 0;
const layerPopups = document.querySelectorAll(`.${popupOption.wrapperClassName}`);
const btnLayerPopup = document.querySelectorAll('[aria-haspopup="dialog"]');
const btnLayerClose = document.querySelectorAll('[data-popup-close]');
const autoPopups = document.querySelectorAll('[data-popup-auto="true"]'); // 화면 시작 시 자동으로 뜨는 팝업

let popupFunc = function() {

    // option Event
    let optionEvent = {
        // 팝업 dimmed 생성 (dimmed 옵션 true 일 경우 동작, default : true)
        createdDimmed: () => {
            const popupDimmed = document.querySelectorAll(`.${popupOption.dimmedClassName}`);
            if (popupDimmed.length === 0) {
                const createDiv = document.createElement('div');
                createDiv.classList.add(popupOption.dimmedClassName);
                document.querySelector('body').appendChild(createDiv);
            };
        },
        // 팝업 dimmed click 시 모든 팝업 닫기 (dimmedClickClose 옵션 true 일 경우 동작, default : true)
        popupDimmedClose: (element) => {
            element.addEventListener('click', function(event) {
                const popupDimmed = document.querySelectorAll(`.${popupOption.dimmedClassName}`);
                if (focusElement.length > 0) {
                    if (event.target === event.currentTarget && popupDimmed.length > 0) {
                        event.preventDefault();
                        clickEvent.popupCloseAll();
                        optionEvent.dimmedStyleDeleteAll();
                        optionEvent.scrollLockRemove();
                        clickEvent.popupDataReset(); 
                    };
                };
                // 저장된 focusElement 값이 없을 경우 (화면 시작 시 오픈 되는 팝업 등 케이스)
                if (element.getAttribute('data-popup-auto') === 'true' && popupDimmed.length > 0) {
                    event.preventDefault();
                    optionEvent.dimmedStyleDeleteAll();
                    optionEvent.scrollLockRemove();
                    clickEvent.popupDataReset();
                    for (let i = 0; layerPopups.length > i; i++) layerPopups[i].classList.remove(popupOption.openClassName);
                    document.body.setAttribute('tabindex', '0');
                    document.body.focus();
                };
            });
        },
        // 팝업 open 시 body scroll Lock (scrollLock 옵션 true 일 경우 동작, default : true)
        scrollLock: () => {
            document.body.classList.add(popupOption.scrollLockClassName);
        },
        // 상위 팝업 닫기 시 아래 opacity style 삭제 (dimmed 옵션 true 일 경우 동작, default : true)
        popupStyleDelete: (target) => {
            const targetPopupDepth = Number(target.getAttribute('data-popup-depth'));
            console.log(targetPopupDepth);
            document.querySelector(`[data-popup-depth='${targetPopupDepth - 1}']`).classList.remove(popupOption.dimmedPrevClassName);
        },
        // 팝업 dimmed, 팝업 opacity style 삭제 (dimmed 옵션 true 일 경우 동작, default : true)
        dimmedStyleDeleteAll: () => {
            const popupDimmedTarget = document.querySelector(`.${popupOption.dimmedClassName}`);
            for (let i = 0; layerPopups.length > i; i++) {
                layerPopups[i].classList.remove(popupOption.dimmedPrevClassName);
                layerPopups[i].removeAttribute('data-popup-depth');
            };
            popupDimmedTarget.style.opacity = 0;
            popupDimmedTarget.addEventListener('transitionend', function() {
                popupDimmedTarget.remove();
            });
        },
        // 팝업 close 시 body scroll Lock 해지 (scrollLock 옵션 true 일 경우 동작, default : true)
        scrollLockRemove: () => {
            document.body.classList.remove(popupOption.scrollLockClassName);
        },
    };

    // click Event
    let clickEvent = {
        // 팝업 열기
        popupOpen: (e) => {
            if (popupOption.dimmed) optionEvent.createdDimmed();
            
            // 팝업 포커스 Element 저장
            popupDepth += 1;
            focusElement.splice((popupDepth - 1), 0, e.currentTarget);
            let keydown;
            layerPopups.forEach((layerPopup) => {
                if (layerPopup.getAttribute('data-popup') === e.currentTarget.getAttribute('data-popup')) {
                    
                    layerPopup.classList.add(popupOption.openClassName);
                    layerPopup.setAttribute('data-popup-depth', popupDepth);

                    if (popupOption.dimmedClickClose) optionEvent.popupDimmedClose(layerPopup);
                    if (popupOption.scrollLock) optionEvent.scrollLock();

                    // 팝업 open 시 팝업 타이틀로 포커스 이동
                    let popupTitle = layerPopup.querySelector(`.${popupOption.titleClassName}`);
                    popupTitle.focus();
                    popupTitle.addEventListener('keydown', function (e) {
                        if ((e.key == 'Tab' && e.shiftKey) || e.key == 'ArrowLeft') e.preventDefault();
                    });
                    console.log('1');
                    // if (!keydown) {
                        layerPopup.addEventListener('keydown', function (e) {
                            clickEvent.escKeyClose(layerPopup, e);
                            this.removeEventListener("keydown",arguments.callee);
                        });
                    // }
                };
            });

            // 팝업 위 팝업이 뜰 경우 이전 팝업 opacity (dimmed 옵션 true 일 경우 동작, default : true)
            if (popupOption.dimmed && popupDepth > 1) {
                document.querySelector(`[data-popup-depth='${popupDepth - 1}']`).classList.add(popupOption.dimmedPrevClassName);
            }

        },
        // 팝업 닫기
        popupClose: (e) => {
            layerPopups.forEach((layerPopup) => {
                // 팝업 전체 닫기
                if (e.currentTarget.getAttribute('data-popup-close-all') === 'true') {
                    clickEvent.popupCloseAll();
                // 해당 팝업만 닫기
                } else if (layerPopup.getAttribute('data-popup') === e.currentTarget.getAttribute('data-popup-close')) {
                    // 오늘 하루 or 일주일 열지 않기
                    const notOpenCheck = layerPopup.querySelector('[data-check-open]');
                    if (notOpenCheck != null && notOpenCheck.checked) {
                        if (notOpenCheck.getAttribute('data-check-open') === 'today') {
                            closeOption.setCookie(layerPopup.getAttribute('data-popup'), 'Y', 1);
                        } else if (notOpenCheck.getAttribute('data-check-open') === 'week') {
                            closeOption.setCookie(layerPopup.getAttribute('data-popup'), 'Y', 7);
                        };
                    };

                    layerPopup.classList.remove(popupOption.openClassName);                    

                    if (focusElement.length > 0) {
                        focusElement[popupDepth - 1].focus();
                        focusElement.splice((popupDepth - 1), 1);
                        popupDepth -= 1;
                    };

                    // 저장된 focusElement 값이 없을 경우 (화면 시작 시 오픈 되는 팝업 등 케이스)
                    if (layerPopup.getAttribute('data-popup-auto') === 'true') {
                        const $thisPopupDepth = layerPopup.getAttribute('data-popup-depth');
                        if ($thisPopupDepth > 1) {
                            const prevPopupElement = document.querySelector(`[data-popup-depth='${$thisPopupDepth - 1}']`);
                            prevPopupElement.querySelector(`.${popupOption.titleClassName}`).focus();
                        } else {
                            document.body.setAttribute('tabindex', '0');
                            document.body.focus();
                        };
                    };
                    
                    layerPopup.removeEventListener('keydown', function (e) {
                        return clickEvent.escKeyClose(layerPopup, e);
                    });
                };
            });
            // 열린 팝업이 없을 때
            const openPopups = document.querySelectorAll(`.${popupOption.openClassName}`);
            if (openPopups.length === 0) {
                if (popupOption.dimmed) optionEvent.dimmedStyleDeleteAll();
                if (popupOption.scrollLock) optionEvent.scrollLockRemove();
                // 팝업 포커스 관련 data reset
                clickEvent.popupDataReset();
            // 열린 팝업이 있을 때
            } else if (openPopups.length > 0) {
                if (popupOption.dimmed) optionEvent.popupStyleDelete(e.currentTarget);
            };
        },
        // ESC 키로 팝업 닫기
        escKeyClose: (element, e) => {
            // layerPopups.forEach((layerPopup) => {
            // const popupDimmed = document.querySelectorAll(`.${popupOption.dimmedClassName}`);
            // if (popupDimmed.length > 0) {
                if (e.key == 'Escape') {
                    console.log('2')
                    element.classList.remove(popupOption.openClassName);
                    if (focusElement.length > 0) {
                        focusElement[popupDepth - 1].focus();
                        focusElement.splice((popupDepth - 1), 1);
                        popupDepth -= 1;
                    } 
                    // 저장된 focusElement 값이 없을 경우 (화면 시작 시 오픈 되는 팝업 등 케이스)
                    if (element.getAttribute('data-popup-auto') === 'true') {
                        const $thisPopupDepth = layerPopup.getAttribute('data-popup-depth');
                        if ($thisPopupDepth > 1) {
                            const prevPopupElement = document.querySelector(`[data-popup-depth='${$thisPopupDepth - 1}']`);
                            prevPopupElement.querySelector(`.${popupOption.titleClassName}`).focus();
                        } else {
                            document.body.setAttribute('tabindex', '0');
                            document.body.focus();
                        };
                    };
                    // 열린 팝업이 없을 때
                    const openPopups = document.querySelectorAll(`.${popupOption.openClassName}`);
                    if (openPopups.length === 0) {
                        if (popupOption.dimmed) optionEvent.dimmedStyleDeleteAll();
                        if (popupOption.scrollLock) optionEvent.scrollLockRemove();
                        // 팝업 포커스 관련 data reset
                        clickEvent.popupDataReset();
                    // 열린 팝업이 있을 때
                    } else if (openPopups.length > 0) {
                        if (popupOption.dimmed) return optionEvent.popupStyleDelete(element);
                    };
                }
            // });
            // };
        },
        // 팝업 close 버튼 키보드 접근 시 (tab 키, 화살표 -> 버튼) 
        closeBtnKeydown: (e) => {
            if (e.key == 'Tab' || e.key == 'ArrowRight') {
                layerPopups.forEach((layerPopup) => {
                    if (layerPopup.getAttribute('data-popup') === e.target.getAttribute('data-popup-close')) {
                        e.preventDefault();
                        layerPopup.querySelector(`.${popupOption.titleClassName}`).focus();
                    };
                });
            };
        },
        // 팝업 포커스 관련 data reset
        popupDataReset: () => {
            focusElement = [];
            popupDepth = 0;
        },
        // 모든 팝업 닫기
        popupCloseAll: () => {
            for (let i = 0; layerPopups.length > i; i++) layerPopups[i].classList.remove(popupOption.openClassName);
            console.log(focusElement);
            focusElement[0].focus();
        },
    };

    // click Action
    let clickAction = {
        addClick: (e) => {
            // 팝업 호출 버튼
            btnLayerPopup.forEach((btnLayerPopupOpen) => {
                btnLayerPopupOpen.addEventListener('click', clickEvent.popupOpen);
            });
            // 팝업 닫기 버튼
            btnLayerClose.forEach((btnLayerPopupClose) => {
                btnLayerPopupClose.addEventListener('click', clickEvent.popupClose);
                // 팝업 마크업 기준 젤 하단에 들어가는 닫기 버튼 일 경우에만 키보드 포커스 제어
                if (btnLayerPopupClose.classList.contains(`${popupOption.closeBtnClassName}`)) {
                    btnLayerPopupClose.addEventListener('keydown', clickEvent.closeBtnKeydown);
                };
            });
        },
    };

    // popupCloseOption
    let closeOption = {
        // 쿠키 설정
        setCookie: (name, value, expiredays) => {
            let todayDate = new Date();
            todayDate.setDate(todayDate.getDate() + expiredays);
            document.cookie = name + '=' + escape(value) + '; path=/; expires=' + todayDate.toGMTString() + ';'
        },
    };

    // 화면 시작 시 오픈 되는 팝업
    let startPopup = {
        init : () => {
            startPopup.getCookie();
            autoPopups.forEach((autoPopup) => {
                // 쿠기 저장 된 값으로 오늘 하루 OR 일주일 열지 않는 팝업 제외
                if(cookieCheckValue.length > 0) {
                    for (let i = 0; cookieCheckValue.length > i; i++) {
                        if (autoPopups.length > 0 && autoPopup.getAttribute('data-popup') != cookieCheckValue[i]) {
                            startPopup.openStartPopup(autoPopup);
                        };
                    };
                } else {
                    startPopup.openStartPopup(autoPopup);
                };
                autoPopup.addEventListener('keydown', function (e) {
                    if (e.key == 'Escape') clickEvent.escKeyClose(autoPopup);
                });
            });
        },
        openStartPopup: (autoPopup) => {
            if (popupOption.dimmed) optionEvent.createdDimmed();
            popupDepth += 1;

            autoPopup.classList.add(popupOption.openClassName);
            autoPopup.setAttribute('data-popup-depth', popupDepth);

            if (popupOption.dimmedClickClose) optionEvent.popupDimmedClose(autoPopup);
            if (popupOption.scrollLock) optionEvent.scrollLock();

            // 팝업 open 시 팝업 타이틀로 포커스 이동
            let popupTitle = autoPopup.querySelector(`.${popupOption.titleClassName}`);
            popupTitle.focus();
            popupTitle.addEventListener('keydown', function (e) {
                if ((e.key == 'Tab' && e.shiftKey) || e.key == 'ArrowLeft') e.preventDefault();
            });
            
            // 팝업 위 팝업이 뜰 경우 이전 팝업 opacity (dimmed 옵션 true 일 경우 동작, default : true)
            if (popupOption.dimmed && popupDepth > 1) autoPopups[popupDepth - 2].classList.add(popupOption.dimmedPrevClassName);
        },
        // 쿠키 값 확인
        getCookie: () => {
            cookieData = document.cookie;
            if (cookieData != '') {
                let cookieArray = cookieData.split('; ');
                cookieArray.forEach((cookie) => {
                    let cookieName = cookie.split("=");
                    if (cookieName[1] === "Y") cookieCheckValue.push(cookieName[0]);
                });
            };
        },
    };

    let obj = {
        init: () => {
            clickAction.addClick();
        },
        setCookie: (name, value, expiredays) => {
            closeOption.setCookie(name, value, expiredays);
        },
        startOption: () => {
            startPopup.init();
        }
    };
    return obj;
}();

// Load Event
window.addEventListener('load', () => {
    popupFunc.init();
    // 시작시 open 되는 팝업이 있을 경우에만 함수 사용
    popupFunc.startOption();
});