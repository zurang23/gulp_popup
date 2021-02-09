// 팝업 옵션 설정
const popupOption = {
    wrapperClassName: 'wrap-layer-popup', // 팝업 wrapper class name
    dimmed: true, // 팝업 딤드 유무
    dimmedClassName: 'popup-dimmed', // 팝업 dimmed class name
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
let popupDepth = 0;
let cookieData, layerPopups, btnLayerPopup, btnLayerClose, autoPopups, keyEscapeEvent, KeyboardEventElement;

// 키보드 ESC 키 동작 시 keyEvent.keyEscape 변수 값 변경 (변수 변경 감지 중 - 변수 값에 따라 popupCommon.escKeyClose 이벤트 호출)
const keyEvent = {
    get keyEscape() {
        return this._state;
    },
    set keyEscape(state) {
        this._state = state;
        if (state) popupCommon.escKeyClose(KeyboardEventElement, keyEscapeEvent);
    },
};

let popupCommon = function() {
    let init = {
        // 전역 변수 값 설정
        globalVariable: () => {
            layerPopups = document.querySelectorAll(`.${popupOption.wrapperClassName}`);
            btnLayerPopup = document.querySelectorAll('[aria-haspopup="dialog"]');
            btnLayerClose = document.querySelectorAll('[data-popup-close]');
        },
    };
    // option Event
    let optionEvent = {
        // 팝업 dimmed 생성
        createdDimmed: () => {
            const popupDimmed = document.querySelectorAll(`.${popupOption.dimmedClassName}`);
            if (popupDimmed.length === 0) {
                const createDiv = document.createElement('div');
                createDiv.classList.add(popupOption.dimmedClassName);
                document.querySelector('body').appendChild(createDiv);
            };
        },
        // popupDimmedClickAction 실행시 실행되는 이벤트 (dimmed 삭제, 모든 팝업 닫기, 스크롤 락 해지, 포커스 이동, 포커스 data reset 이벤트 포함)
        popupDimmedCloseEvent: (event) => {
            event.preventDefault();
            optionEvent.dimmedeDelete(); // 팝업 dimmed 삭제 이벤트 호출
            optionEvent.scrollLockRemove(); // 스크롤 락 해지 이벤트 호출
            // 팝업 전체 닫기 이벤트 호출 기본 
            // (저장 된 focusElement 값이 있는 경우)
            if (focusElement.length > 0) clickEvent.popupCloseAll();
            // (저장된 focusElement 값이 없을 경우 - 화면 시작 시 오픈 되는 팝업 등 케이스)
            else {
                for (let i = 0; layerPopups.length > i; i++) layerPopups[i].classList.remove(popupOption.openClassName);
                document.body.setAttribute('tabindex', '0');
                document.body.focus();
            };
            clickEvent.popupDataReset(); // 팝업 포커스 data reset
        },
        // 팝업 dimmed click Action
        popupDimmedClickAction: (element) => {
            element.addEventListener('click', function(event) {
                // 팝업 dimmed 삭제시 실행되는 이벤트 popupDimmedCloseEvent 호출
                if (event.target === event.currentTarget) optionEvent.popupDimmedCloseEvent(event);
                this.removeEventListener("click",arguments.callee); // 이벤트 삭제
            });
        },
        // 상위 팝업 닫기 시 이전 팝업 opacity style 삭제
        prevPopupStyleDelete: (target, trigger) => {
            const getPopupValue = target.getAttribute('data-popup-close') || target.getAttribute('data-popup');
            const targetPopupDepth = Number(document.querySelector(`.${popupOption.wrapperClassName}[data-popup='${getPopupValue}']`).getAttribute('data-popup-depth'));
            if (trigger ===  'escKey') document.querySelector(`.${popupOption.wrapperClassName}[data-popup-depth='${targetPopupDepth}']`).classList.remove(popupOption.dimmedPrevClassName);
            else document.querySelector(`.${popupOption.wrapperClassName}[data-popup-depth='${targetPopupDepth - 1}']`).classList.remove(popupOption.dimmedPrevClassName);
        },
        // 팝업 dimmed 삭제
        dimmedeDelete: () => {
            const popupDimmedTarget = document.querySelector(`.${popupOption.dimmedClassName}`);
            for (let i = 0; layerPopups.length > i; i++) {
                layerPopups[i].classList.remove(popupOption.dimmedPrevClassName);
                layerPopups[i].removeAttribute('data-popup-depth');
            };
            popupDimmedTarget.style.opacity = 0;
            popupDimmedTarget.addEventListener('transitionend', function() {
                popupDimmedTarget.remove();
            });
            keyEvent.keyEscape = false;
        },
        // 팝업 open 시 body scroll Lock
        scrollLock: () => {
            document.body.classList.add(popupOption.scrollLockClassName);
        },
        // 팝업 close 시 body scroll Lock 해지
        scrollLockRemove: () => {
            document.body.classList.remove(popupOption.scrollLockClassName);
        },
    };

    // click Event
    let clickEvent = {
        // 클릭으로 팝업 열기
        popupOpen: (e) => {
            e.preventDefault();
            if (popupOption.dimmed) optionEvent.createdDimmed(); // 팝업 dimmed 생성 (dimmed 옵션 true 일 경우 동작, default : true)
            
            layerPopups.forEach((layerPopup) => {
                if (layerPopup.getAttribute('data-popup') === e.currentTarget.getAttribute('data-popup')) {
                    popupDepth += 1; // 팝업 depth 저장
                    focusElement.splice((popupDepth - 1), 0, e.currentTarget); // 팝업 포커스 Element 저장
                    clickEvent.openCommonEvent(layerPopup); // 팝업 오픈 공통 이벤트 호출
                };
            });

            // 팝업 위 팝업이 뜰 경우 이전 팝업 opacity (dimmed 옵션 true 일 경우 동작, default : true)
            if (popupOption.dimmed && popupDepth > 1) {
                document.querySelector(`[data-popup-depth='${popupDepth - 1}']`).classList.add(popupOption.dimmedPrevClassName);
            };

        },
        // 팝업 오픈 공통 이벤트
        openCommonEvent: (popupElement) => {
            popupElement.classList.add(popupOption.openClassName); // 팝업 활성화 class 추가
            popupElement.setAttribute('data-popup-depth', popupDepth); // 활성화 된 팝업 depth 값 추가

            // 팝업 dimmed 클릭 시 팝업 닫기 이벤트 호출 (dimmed 옵션 && dimmedClickClose 옵션 둘 다 true 일 경우 동작, default : true)
            if (popupOption.dimmed && popupOption.dimmedClickClose) optionEvent.popupDimmedClickAction(popupElement);
            // 스크롤 락 이벤트 실행 (scrollLock 옵션 true 일 경우 동작, default : true)
            if (popupOption.scrollLock) optionEvent.scrollLock();

            // 팝업 open 시 팝업 타이틀로 포커스 이동
            let popupTitle = popupElement.querySelector(`.${popupOption.titleClassName}`);
            popupTitle.focus();
            // 팝업 타이틀에서 shift+tab 또는 <- 화살표 키 키보드 동작 시 이벤트 동작 중지 (팝업 밖으로 포커스 이동 방지)
            popupTitle.addEventListener('keydown', function (e) {
                if ((e.key == 'Tab' && e.shiftKey) || e.key == 'ArrowLeft') e.preventDefault();
            });
            KeyboardEventElement = popupElement;
            // if (keyEvent.keyEscape) clickEvent.escKeyClose(popupElement, keyEscapeEvent);
        },
        // 클릭으로 팝업 닫기
        popupClose: (e) => {
            layerPopups.forEach((layerPopup) => {
                // 팝업 전체 닫기
                if (e.currentTarget.getAttribute('data-popup-close-all') === 'true') {
                    clickEvent.popupCloseAll();
                // 해당 팝업만 닫기
                } else if (layerPopup.getAttribute('data-popup') === e.currentTarget.getAttribute('data-popup-close')) {
                    // 오늘 하루 or 일주일 열지 않기 값 저장
                    const notOpenCheck = layerPopup.querySelector('[data-check-open]');
                    if (notOpenCheck != null && notOpenCheck.checked) {
                        if (notOpenCheck.getAttribute('data-check-open') === 'today') closeOption.setCookie(layerPopup.getAttribute('data-popup'), 'Y', 1);
                        else if (notOpenCheck.getAttribute('data-check-open') === 'week') closeOption.setCookie(layerPopup.getAttribute('data-popup'), 'Y', 7);
                    };
                    clickEvent.singleCloseCommonEvent(layerPopup, 'close'); // 단일 팝업 닫기 공통 이벤트 호출
                };
            });
            clickEvent.openedPopupCheck(e, 'button'); // openedPopupCheck (현재 열려 있는 팝업 확인) 이벤트 호출
        },
        // 단일 팝업 닫기 공통 이벤트
        singleCloseCommonEvent: (popupElement) => {
            const $thisPopupDepth = popupElement.getAttribute('data-popup-depth');
            popupElement.classList.remove(popupOption.openClassName); // 팝업 활성화 class 삭제
            
            // 클릭으로 팝업 활성화 했을 경우 포커스 이동 (저장된 focusElement 값이 있을 경우)
            if (focusElement.length > 0) {
                focusElement[popupDepth - 1].focus();
                focusElement.splice((popupDepth - 1), 1);
                popupDepth -= 1;
                KeyboardEventElement = document.querySelector(`.${popupOption.wrapperClassName}[data-popup-depth='${$thisPopupDepth - 1}']`);
            };

            // 화면 시작 시 오픈 되는 팝업 등 케이스 (저장된 focusElement 값이 없을 경우)
            if (popupElement.getAttribute('data-popup-auto') === 'true') {
                if ($thisPopupDepth > 1) {
                    const prevPopupElement = document.querySelector(`[data-popup-depth='${$thisPopupDepth - 1}']`);
                    prevPopupElement.querySelector(`.${popupOption.titleClassName}`).focus();
                } else {
                    document.body.setAttribute('tabindex', '0');
                    document.body.focus();
                };
            };
        },
        // 현재 열려 있는 팝업 체크
        openedPopupCheck: (e, trigger) => {
            // 열린 팝업이 없을 때
            const openPopups = document.querySelectorAll(`.${popupOption.openClassName}`);
            if (openPopups.length === 0) {
                // 팝업 dimmed 삭제 이벤트 호출 (dimmed 옵션 true 일 경우 동작, default : true)
                if (popupOption.dimmed) optionEvent.dimmedeDelete();
                // 스크롤 락 해지 이벤트 호출 (scrollLock 옵션 true 일 경우 동작, default : true)
                if (popupOption.scrollLock) optionEvent.scrollLockRemove();
                clickEvent.popupDataReset(); // 팝업 포커스 관련 data reset
            // 열린 팝업이 있을 때
            } else if (openPopups.length > 0) {
                // 팝업 opacity style 삭제 이벤트 호출 (dimmed 옵션 true 일 경우 동작, default : true)
                if (popupOption.dimmed) {
                    if (trigger === 'escKey') optionEvent.prevPopupStyleDelete(KeyboardEventElement, 'escKey');
                    else optionEvent.prevPopupStyleDelete(e.currentTarget, 'button');
                }
            };
        },
        // ESC 키로 팝업 닫기
        escKeyClose: (element, e) => {
            const openPopups = document.querySelectorAll(`.${popupOption.openClassName}`);
            if (openPopups.length > 0) {
                clickEvent.singleCloseCommonEvent(element, 'esc');
                clickEvent.openedPopupCheck(e, 'escKey');
                // keyEvent.keyEscape = false;
            }
        },
        // 팝업 close 버튼에서  tab 키 또는 화살표 -> 키 키보드 동작 시 팝업 타이틀로 포커스 이동 (팝업 밖으로 포커스 이동 방지)
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
            focusElement[0].focus();
        },
    };

    // click Action
    let clickAction = {
        addClick: (e) => {
            // 팝업 호출 버튼
            btnLayerPopup.forEach((btnLayerPopupOpen) => {
                btnLayerPopupOpen.addEventListener('click', clickEvent.popupOpen);
                btnLayerPopupOpen.addEventListener('keydown', function (e) {
                    if (e.key == 'Enter') clickEvent.popupOpen(e);
                });
            });
            // 팝업 닫기 버튼
            btnLayerClose.forEach((btnLayerPopupClose) => {
                btnLayerPopupClose.addEventListener('click', clickEvent.popupClose);
                // 팝업 마크업 기준 젤 하단에 들어가는 닫기 버튼 일 경우에만 키보드 포커스 제어
                if (btnLayerPopupClose.classList.contains(`${popupOption.closeBtnClassName}`)) {
                    btnLayerPopupClose.addEventListener('keydown', clickEvent.closeBtnKeydown);
                };
            });
            // ESC 키로 팝업 닫기
            // 팝업 내 열린 상태에서 키보드 ESC 키 이벤트 실행 
            window.addEventListener('keydown', function (e) {
                if (e.key == 'Escape') {
                    keyEscapeEvent = e;
                    keyEvent.keyEscape = true;
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
            autoPopups = document.querySelectorAll('[data-popup-auto="true"]'); // 화면 시작 시 자동으로 뜨는 팝업
            autoPopups.forEach((autoPopup) => {
                // 쿠기 저장 된 값으로 오늘 하루 or 일주일 열지 않는 팝업 제외 후 시작 팝업 공통 이벤트 호출
                if (cookieCheckValue.length > 0) {
                    for (let i = 0; cookieCheckValue.length > i; i++) {
                        if (autoPopups.length > 0 && autoPopup.getAttribute('data-popup') != cookieCheckValue[i]) startPopup.openStartPopup(autoPopup);
                    };
                }
                else startPopup.openStartPopup(autoPopup);
            });
        },
        // 시작 팝업 공통 이벤트
        openStartPopup: (autoPopup) => {
            if (popupOption.dimmed) optionEvent.createdDimmed(); // 팝업 dimmed 생성 (dimmed 옵션 true 일 경우 동작, default : true)
            popupDepth += 1; // 팝업 depth 저장
            clickEvent.openCommonEvent(autoPopup); // 팝업 오픈 공통 이벤트 호출
            // 팝업 위 팝업이 뜰 경우 이전 팝업 opacity (dimmed 옵션 true 일 경우 동작, default : true)
            if (popupOption.dimmed && popupDepth > 1) autoPopups[popupDepth - 2].classList.add(popupOption.dimmedPrevClassName);
        },
        // 쿠키 값 확인
        getCookie: () => {
            cookieData = document.cookie;
            console.log(cookieData);
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
            init.globalVariable();
            clickAction.addClick();
        },
        setCookie: (name, value, expiredays) => {
            closeOption.setCookie(name, value, expiredays);
        },
        getCookie: () => {
            startPopup.getCookie();
        },
        startOption: () => {
            startPopup.init();
        },
        escKeyClose: (element, e) => {
            clickEvent.escKeyClose(element, e);
        }
    };
    return obj;
}();

// Load Event
window.addEventListener('load', () => {
    popupCommon.init();
    // 시작시 open 되는 팝업이 있을 경우에만 함수 사용
    popupCommon.getCookie();
    popupCommon.startOption();
});