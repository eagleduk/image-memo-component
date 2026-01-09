
// 시작전(이미지 로드 전), 이미지 로드 후, 텍스트 박스 찍기, 텍스트 입력 중, 라인 그리기 시작, 라인 그리는 중
const _READYSTATE = null;
const _DEFAULTSTATE = 0;
const _TEXTSTATE = 10;
const _TYPINGSTATE = 11;
const _LINESTATE = 20;
const _DRAWINGSTATE = 21;

// 등록/삭제 상태
const _CREATE = 1;
const _DELETE = -1;

export {
    _READYSTATE, _DEFAULTSTATE, _TEXTSTATE, _TYPINGSTATE, _LINESTATE, _DRAWINGSTATE,
    _CREATE, _DELETE
}