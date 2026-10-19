let quillEditor;

document.addEventListener("DOMContentLoaded", () => {
    try {
        const SizeStyle = Quill.import('attributors/style/size');
        SizeStyle.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '30px', '32px'];
        Quill.register(SizeStyle, true);
    } catch (e) {
        console.error("Ошибка при инициализации Quill:", e);
    }

    quillEditor = new Quill('#editor-container', {
        modules: { toolbar: '#toolbar-container' },
        theme: 'snow'
    });

    document.getElementById('btn-font-increase')?.addEventListener('click', () => changeFontSize(2));
    document.getElementById('btn-font-decrease')?.addEventListener('click', () => changeFontSize(-2));
});

function changeFontSize(step) {
    const range = quillEditor.getSelection();
    const index = range ? range.index : 0;
    const length = range ? range.length : quillEditor.getLength();
    const currentFormat = quillEditor.getFormat(index, length);
    let currentSize = currentFormat.size;

    if (!currentSize) {
        const rootStyles = window.getComputedStyle(document.getElementById('editor-container'));
        currentSize = rootStyles.fontSize;
    }

    let newSize = parseInt(currentSize) + step;
    if (newSize < 10) newSize = 10;
    if (newSize > 32) newSize = 32;

    if (range && range.length > 0) {
        quillEditor.format('size', `${newSize}px`);
    } else {
        quillEditor.formatText(index, length, 'size', `${newSize}px`);
    }
}