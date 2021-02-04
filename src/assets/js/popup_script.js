// 팝업 옵션 설정
const popupOption = {
    popupWrapperClassName: 'wrap-layer-popup', // 팝업 wrapper class name
    popupDimmed: true, // 팝업 딤드 유무
    popupDimmedClassName: 'popup-dimmed', // 팝업 딤드 class name
    popupDimmedPrevClassName: 'prev-popup', // 팝업 위 팝업이 뜰 경우 이전 팝업에 추가 되는 class name
    popupDimmedClose: true, // 팝업 딤드 클릭 시 팝업 닫기 기능
    scrollLock: true, // 팝업 오픈 시 body 영역 스크롤 lock 기능
    scrollLockClassName: 'scroll-lock', // body scroll lock class name
    popupOpenClassName: 'popup-open', // 팝업 활성화 시 추가 되는 class name
    popupTitleClassName: 'wrap-layer-popup-title', // 팝업 활성화 시 포커스 될 타이틀 class name
    popupCloseBtnClassName: 'btn-layer-close', // 팝업 닫기 버튼 class name (팝업 마크업 마지막에 들어가는 닫기 버튼)
};

// 전역 변수
let focusElement = [];
let popupDepth = 0;
const layerPopups = document.querySelectorAll(`.${popupOption.popupWrapperClassName}`);
const btnLayerPopup = document.querySelectorAll('[aria-haspopup="dialog"]');
const btnLayerClose = document.querySelectorAll('[data-popup-close]');

let popupFunc = function() {
    // option Event
    let optionEvent = {
        // 팝업 dimmed 생성 (popupDimmed 옵션 true 일 경우 동작, default : true)
        createdDimmed: () => {
            const popupDimmed = document.querySelectorAll(`.${popupOption.popupDimmedClassName}`);
            if (popupDimmed.length === 0) {
                const createDiv = document.createElement("div");
                createDiv.classList.add(popupOption.popupDimmedClassName);
                document.querySelector('body').appendChild(createDiv);
            };
        },
        // 팝업 dimmed click 시 모든 팝업 닫기 (popupDimmedClose 옵션 true 일 경우 동작, default : true)
        popupDimmedClose: (element) => {
            element.addEventListener('click', function(event) {
                if (focusElement.length > 0) {
                    const popupDimmed = document.querySelectorAll(`.${popupOption.popupDimmedClassName}`);
                    if (event.target === event.currentTarget && popupDimmed.length > 0) {
                        event.preventDefault();
                        clickEvent.popupCloseAll();
                        optionEvent.dimmedStyleDeleteAll();
                        optionEvent.scrollLockRemove();
                        clickEvent.popupDataReset();
                    };
                };
            });
        },
        // 팝업 open 시 body scroll Lock (scrollLock 옵션 true 일 경우 동작, default : true)
        scrollLock: () => {
            document.body.classList.add(popupOption.scrollLockClassName);
        },
        // 상위 팝업 닫기 시 아래 opacity style 삭제 (popupDimmed 옵션 true 일 경우 동작, default : true)
        popupStyleDelete: (target) => {
            const targetPopupDepth = Number(target.getAttribute('data-popup-depth'));
            // layerPopups[targetPopupDepth].removeAttribute('style');
            layerPopups[targetPopupDepth].classList.remove(popupOption.popupDimmedPrevClassName);
        },
        // 팝업 dimmed, 팝업 opacity style 삭제 (popupDimmed 옵션 true 일 경우 동작, default : true)
        dimmedStyleDeleteAll: () => {
            const popupDimmedTarget = document.querySelector(`.${popupOption.popupDimmedClassName}`);
            for (let i = 0; layerPopups.length > i; i++) {
                // layerPopups[i].removeAttribute('style');
                layerPopups[i].classList.remove(popupOption.popupDimmedPrevClassName);
                layerPopups[i].removeAttribute('data-popup-depth');
            };
            popupDimmedTarget.style.opacity = 0;
            popupDimmedTarget.addEventListener('transitionend', function(){
                popupDimmedTarget.remove();
            })
        },
        // 팝업 close 시 body scroll Lock 해지 (scrollLock 옵션 true 일 경우 동작, default : true)
        scrollLockRemove: () => {
            document.body.classList.remove(popupOption.scrollLockClassName);
        },
    };
    // click Event
    let clickEvent = {
        popupOpen: (e) => {
            if (popupOption.popupDimmed) optionEvent.createdDimmed();
            
            // 팝업 포커스 Element 저장
            popupDepth += 1;
            focusElement.splice((popupDepth - 1), 0, e.currentTarget);
            
            layerPopups.forEach((layerPopup) => {
                if (layerPopup.getAttribute('data-popup') === e.currentTarget.getAttribute('data-popup')) {
                    layerPopup.classList.add(popupOption.popupOpenClassName);
                    layerPopup.setAttribute('data-popup-depth', popupDepth);

                    if (popupOption.popupDimmedClose) optionEvent.popupDimmedClose(layerPopup);
                    if (popupOption.scrollLock) optionEvent.scrollLock();

                    // 팝업 open 시 팝업 타이틀로 포커스 이동
                    let popupTitle = layerPopup.querySelector(`.${popupOption.popupTitleClassName}`);
                    popupTitle.focus();
                    popupTitle.addEventListener('keydown', function (e) {
                        if ((e.key == 'Tab' && e.shiftKey) || e.key == 'ArrowLeft') e.preventDefault();
                    });
                };
            });

            // 팝업 위 팝업이 뜰 경우 이전 팝업 opacity (popupDimmed 옵션 true 일 경우 동작, default : true)
            if (popupOption.popupDimmed && popupDepth > 1) layerPopups[popupDepth - 2].classList.add(popupOption.popupDimmedPrevClassName);

        },
        popupClose: (e) => {
            layerPopups.forEach((layerPopup) => {
                // 팝업 전체 닫기
                if (e.currentTarget.getAttribute('data-popup-close-all') === 'true') {
                    clickEvent.popupCloseAll();
                // 해당 팝업만 닫기
                } else if (layerPopup.getAttribute('data-popup') === e.currentTarget.getAttribute('data-popup-close')) {
                    layerPopup.classList.remove(popupOption.popupOpenClassName);
                    if (focusElement.length > 0) {
                        focusElement[popupDepth - 1].focus();
                        focusElement.splice((popupDepth - 1), 1);
                        popupDepth -= 1;
                    };
                };
            });
            // 열린 팝업이 없을 때
            const openPopups = document.querySelectorAll(`.${popupOption.popupOpenClassName}`);
            if (openPopups.length === 0) {
                if (popupOption.popupDimmed) optionEvent.dimmedStyleDeleteAll();
                if (popupOption.scrollLock) optionEvent.scrollLockRemove();
                // 팝업 포커스 관련 data reset
                clickEvent.popupDataReset();

            // 열린 팝업이 있을 때
            } else if (openPopups.length > 0) {
                if (popupOption.popupDimmed) optionEvent.popupStyleDelete(e.currentTarget);
            };
        },
        // 팝업 close 버튼 키보드 접근 시 (tab 키, 화살표 -> 버튼) 
        closeBtnKeydown: (e) => {
            if (e.key == 'Tab' || e.key == 'ArrowRight') {
                layerPopups.forEach((layerPopup) => {
                    if (layerPopup.getAttribute('data-popup') === e.target.getAttribute('data-popup-close')) {
                        e.preventDefault();
                        layerPopup.querySelector(`.${popupOption.popupTitleClassName}`).focus();
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
            for (let i = 0; layerPopups.length > i; i++) layerPopups[i].classList.remove(popupOption.popupOpenClassName);
            focusElement[0].focus();
        }
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
                if (btnLayerPopupClose.classList.contains('btn-layer-close')) {
                    btnLayerPopupClose.addEventListener('keydown', clickEvent.closeBtnKeydown);
                }
            });
        },
    };


    let obj = {
        init: () => {
            clickAction.addClick();
        },
    };
    return obj;
}();

// Load Event
window.addEventListener('load', () => {
    popupFunc.init();
});