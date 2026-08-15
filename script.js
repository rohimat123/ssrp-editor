// =========================================================
// SSRP EDITOR - SCRIPT.JS
// =========================================================


// =========================================================
// CANVAS
// =========================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


// =========================================================
// IMAGE
// =========================================================

let image = new Image();

let imagePos = {
    x: 0,
    y: 0,
    dragging: false,
    dragOffset: {
        x: 0,
        y: 0
    }
};

let imageLoaded = false;

let imageDrawSize = {
    width: 0,
    height: 0
};


// =========================================================
// TEXT
// =========================================================

let texts = [];

let undoStack = [];
let redoStack = [];

let fontSize = 17;
let lineHeight = fontSize * 1.2;


// =========================================================
// INITIAL LOAD
// =========================================================

window.addEventListener('load', () => {

    canvas.width = 800;
    canvas.height = 600;

    setupAddButtons();

    drawCanvas();

});


// =========================================================
// SAVE STATE
// =========================================================

function saveState() {

    undoStack.push(
        JSON.parse(JSON.stringify(texts))
    );

    redoStack = [];

}


// =========================================================
// IMAGE INPUT
// =========================================================

document
    .getElementById('imageInput')
    .addEventListener('change', (e) => {

        handleImageUpload(e.target.files[0]);

    });

// =========================================================
// PASTE IMAGE
// =========================================================

document.addEventListener('paste', (e) => {

    const items = e.clipboardData?.items;

    if (!items) return;

    for (const item of items) {

        // Hanya proses jika clipboard berisi gambar
        if (item.type.startsWith('image/')) {

            e.preventDefault();

            const file = item.getAsFile();

            if (file) {

                handleImageUpload(file);

            }

            break;

        }

    }

});

// =========================================================
// CLICK CANVAS
// =========================================================

canvas.addEventListener('click', () => {

    if (!imageLoaded) {

        document
            .getElementById('imageInput')
            .click();

    }

});


// =========================================================
// HANDLE IMAGE UPLOAD
// =========================================================

function handleImageUpload(file) {

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

        image.onload = () => {

            imageLoaded = true;

            const canvasRatio = 4 / 3;
            const imgRatio =
                image.width / image.height;


            if (imgRatio > canvasRatio) {

                imageDrawSize.height =
                    canvas.height;

                imageDrawSize.width =
                    canvas.height * imgRatio;

            } else {

                imageDrawSize.width =
                    canvas.width;

                imageDrawSize.height =
                    canvas.width / imgRatio;

            }


            // Posisi gambar di tengah

            imagePos.x =
                (canvas.width -
                    imageDrawSize.width) / 2;

            imagePos.y =
                (canvas.height -
                    imageDrawSize.height) / 2;


            drawCanvas();

        };


        image.src = event.target.result;

    };


    reader.readAsDataURL(file);

}


// =========================================================
// RECALCULATE TEXT POSITION
// =========================================================
//
// Fungsi ini penting supaya teks tidak saling menimpa.
//
// TOP:
// Teks disusun dari atas -> bawah.
//
// BOTTOM:
// Teks disusun dari bawah -> atas.
// =========================================================

function recalculateTextPositions() {

    // =====================================================
    // TEXT ATAS
    // =====================================================

    const topTexts = texts.filter(
        textObj => textObj.position === 'top'
    );


    let topY = 30;


    topTexts.forEach((textObj) => {

        textObj.x = 10;

        textObj.y = topY;


        const lines =
            textObj.text.split('\n').length;


        topY +=
            lines * lineHeight;

    });


    // =====================================================
    // TEXT BAWAH
    // =====================================================

    const bottomTexts = texts.filter(
        textObj => textObj.position === 'bottom'
    );


    /*
     * Kita mulai dari bagian paling bawah canvas.
     *
     * Contoh:
     *
     * *testing 1
     * *testing 2
     * *testing 3
     *
     * testing 3 berada paling bawah.
     */


    let bottomY =
        canvas.height - 30;


    for (
        let i = bottomTexts.length - 1;
        i >= 0;
        i--
    ) {

        const textObj =
            bottomTexts[i];


        const lines =
            textObj.text.split('\n').length;


        textObj.x = 10;


        /*
         * y adalah baseline baris pertama.
         */

        textObj.y =
            bottomY -
            ((lines - 1) * lineHeight);


        /*
         * Teks berikutnya ditempatkan
         * di atas teks ini.
         */

        bottomY =
            textObj.y -
            lineHeight;

    }


    // =====================================================
    // TEXT NORMAL / DEFAULT
    // =====================================================

    const normalTexts = texts.filter(
        textObj =>
            !textObj.position ||
            textObj.position === 'normal'
    );


    let normalY = 50;


    normalTexts.forEach((textObj) => {

        textObj.x = 50;

        textObj.y = normalY;


        const lines =
            textObj.text.split('\n').length;


        normalY +=
            lines * lineHeight;

    });

}


// =========================================================
// DRAW CANVAS
// =========================================================

function drawCanvas() {

    // Background

    ctx.fillStyle = "#1e1e1e";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // =====================================================
    // IMAGE
    // =====================================================

    if (!imageLoaded) {

        ctx.font = '20px Arial';

        ctx.fillStyle =
            'rgba(255, 255, 255, 0.5)';

        ctx.textAlign = 'center';

        ctx.fillText(
            'Klik atau drop gambar di sini',
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.textAlign = 'left';

    } else {

        ctx.drawImage(
            image,
            imagePos.x,
            imagePos.y,
            imageDrawSize.width,
            imageDrawSize.height
        );

    }


    // =====================================================
    // UPDATE POSITION TEXT
    // =====================================================

    recalculateTextPositions();


    // =====================================================
    // TEXT STYLE
    // =====================================================

    ctx.font =
        `bold ${fontSize}px Calibri`;

    ctx.lineWidth = 2;


    // =====================================================
    // DRAW TEXT
    // =====================================================

    texts.forEach((textObj) => {

        const isActionText =
            textObj.text.startsWith("*");


        ctx.strokeStyle = "black";


        ctx.fillStyle =
            isActionText
                ? "#C2A2DA"
                : "#FFFFFF";


        ctx.shadowColor = "black";

        ctx.shadowBlur = 4;

        ctx.shadowOffsetX = 2;

        ctx.shadowOffsetY = 2;


        textObj.text
            .split('\n')
            .forEach((line, i) => {

                ctx.strokeText(
                    line,
                    textObj.x,
                    textObj.y +
                    (i * lineHeight)
                );


                ctx.fillText(
                    line,
                    textObj.x,
                    textObj.y +
                    (i * lineHeight)
                );

            });


        ctx.shadowColor =
            "transparent";

    });

}


// =========================================================
// SETUP BUTTON TAMBAHKAN
// =========================================================
//
// Tombol pertama:
// Tambahkan⬆
//
// Tombol kedua:
// Tambahkan⬇
// =========================================================

function setupAddButtons() {

    const buttons =
        document.querySelectorAll(
            '.controls button'
        );


    if (buttons.length < 2) {

        console.warn(
            'Tombol Tambahkan tidak ditemukan.'
        );

        return;

    }


    const topButton =
        buttons[0];


    const bottomButton =
        buttons[1];


    // Hapus onclick dari HTML

    topButton.removeAttribute(
        'onclick'
    );

    bottomButton.removeAttribute(
        'onclick'
    );


    // =====================================================
    // TOMBOL ATAS
    // =====================================================

    topButton.addEventListener(
        'click',
        () => {

            addText('top');

        }
    );


    // =====================================================
    // TOMBOL BAWAH
    // =====================================================

    bottomButton.addEventListener(
        'click',
        () => {

            addText('bottom');

        }
    );

}


// =========================================================
// ADD TEXT
// =========================================================

function addText(position = 'normal') {

    const textInput =
        document.getElementById(
            'textInput'
        );


    const textValue =
        textInput.value.trim();


    if (!textValue) {

        return;

    }


    // Simpan kondisi sebelum perubahan

    saveState();


    // =====================================================
    // TAMBAHKAN ATAS
    // =====================================================

    if (position === 'top') {

        texts.push({

            text: textValue,

            x: 10,

            y: 30,

            position: 'top'

        });

    }


    // =====================================================
    // TAMBAHKAN BAWAH
    // =====================================================

    else if (position === 'bottom') {

        texts.push({

            text: textValue,

            x: 10,

            y: canvas.height - 30,

            position: 'bottom'

        });

    }


    // =====================================================
    // NORMAL
    // =====================================================

    else {

        texts.push({

            text: textValue,

            x: 50,

            y: 50,

            position: 'normal'

        });

    }


    // Kosongkan chatbox

    textInput.value = '';


    // Gambar ulang

    drawCanvas();

}


// =========================================================
// UNDO
// =========================================================

function undoAction() {

    if (undoStack.length === 0) {

        return;

    }


    redoStack.push(
        JSON.parse(
            JSON.stringify(texts)
        )
    );


    texts =
        undoStack.pop();


    drawCanvas();

}


// =========================================================
// REDO
// =========================================================

function redoAction() {

    if (redoStack.length === 0) {

        return;

    }


    undoStack.push(
        JSON.parse(
            JSON.stringify(texts)
        )
    );


    texts =
        redoStack.pop();


    drawCanvas();

}


// =========================================================
// CHANGE FONT SIZE
// =========================================================

function changeFontSize(delta) {

    fontSize =
        Math.max(
            12,
            Math.min(
                30,
                fontSize + delta
            )
        );


    lineHeight =
        fontSize * 1.2;


    const label =
        document.getElementById(
            'fontSizeLabel'
        );


    if (label) {

        label.textContent =
            fontSize;

    }


    /*
     * Posisi semua teks otomatis
     * dihitung ulang.
     */

    drawCanvas();

}


// =========================================================
// DOWNLOAD IMAGE
// =========================================================

function downloadImage() {

    drawCanvas();


    const link =
        document.createElement('a');


    link.download =
        'ssrp-image.png';


    link.href =
        canvas.toDataURL(
            'image/png'
        );


    link.click();

}


// =========================================================
// UPLOAD IMGUR
// =========================================================

async function uploadToImgur() {

    const linkContainer =
        document.getElementById(
            'imgurLinkContainer'
        );


    const linkInput =
        document.getElementById(
            'imgurLinkInput'
        );


    drawCanvas();


    linkInput.value =
        "Uploading to Imgur...";


    linkContainer.style.display =
        'block';


    try {

        const imageData =
            canvas
                .toDataURL('image/png')
                .split(',')[1];


        const response =
            await fetch(
                'https://api.imgur.com/3/image',
                {

                    method: 'POST',

                    headers: {

                        'Authorization':
                            'Client-ID 6b1da49ab5fce27',

                        'Content-Type':
                            'application/x-www-form-urlencoded'

                    },

                    body:
                        `image=${encodeURIComponent(imageData)}`

                }
            );


        const result =
            await response.json();


        if (result.success) {

            linkInput.value =
                `[img]${result.data.link}[/img]`;

        } else {

            linkInput.value =
                'Upload failed';

        }

    } catch (error) {

        linkInput.value =
            `Error: ${error.message}`;

    }

}


// =========================================================
// COPY IMGUR LINK
// =========================================================

function copyImgurLink() {

    const input =
        document.getElementById(
            'imgurLinkInput'
        );


    input.select();

    input.setSelectionRange(
        0,
        99999
    );


    document.execCommand(
        'copy'
    );


    const btn =
        document.querySelector(
            '#imgurLinkContainer button:first-of-type'
        );


    if (btn) {

        btn.textContent =
            'Copied!';


        setTimeout(() => {

            btn.textContent =
                'Copy';

        }, 2000);

    }

}


// =========================================================
// CLOSE IMGUR
// =========================================================

function closeImgurLink() {

    const container =
        document.getElementById(
            'imgurLinkContainer'
        );


    if (container) {

        container.style.display =
            'none';

    }

}


// =========================================================
// MOUSE DRAG IMAGE
// HANYA HORIZONTAL
// =========================================================

canvas.addEventListener(
    'mousedown',
    (e) => {

        if (!imageLoaded) {

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        const mouseX =
            e.clientX -
            rect.left;


        const mouseY =
            e.clientY -
            rect.top;


        if (

            mouseX >= imagePos.x &&

            mouseX <=
            imagePos.x +
            imageDrawSize.width &&

            mouseY >= imagePos.y &&

            mouseY <=
            imagePos.y +
            imageDrawSize.height

        ) {

            imagePos.dragging =
                true;


            imagePos.dragOffset = {

                x:
                    mouseX -
                    imagePos.x,

                y:
                    mouseY -
                    imagePos.y

            };


            canvas.style.cursor =
                'grabbing';

        }

    }
);


// =========================================================
// MOUSE MOVE
// =========================================================

canvas.addEventListener(
    'mousemove',
    (e) => {

        if (
            !imageLoaded ||
            !imagePos.dragging
        ) {

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        const mouseX =
            e.clientX -
            rect.left;


        let newX =
            mouseX -
            imagePos.dragOffset.x;


        // Batasi gambar supaya
        // tidak keluar dari canvas

        newX =
            Math.min(
                0,
                Math.max(
                    canvas.width -
                    imageDrawSize.width,
                    newX
                )
            );


        imagePos.x =
            newX;


        drawCanvas();

    }
);


// =========================================================
// MOUSE UP
// =========================================================

canvas.addEventListener(
    'mouseup',
    () => {

        imagePos.dragging =
            false;


        canvas.style.cursor =
            'grab';

    }
);


// =========================================================
// MOUSE LEAVE
// =========================================================

canvas.addEventListener(
    'mouseleave',
    () => {

        imagePos.dragging =
            false;


        canvas.style.cursor =
            'grab';

    }
);


// =========================================================
// TOUCH START
// =========================================================

canvas.addEventListener(
    'touchstart',
    (e) => {

        if (!imageLoaded) {

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        const touch =
            e.touches[0];


        const x =
            touch.clientX -
            rect.left;


        const y =
            touch.clientY -
            rect.top;


        if (

            x >= imagePos.x &&

            x <=
            imagePos.x +
            imageDrawSize.width &&

            y >= imagePos.y &&

            y <=
            imagePos.y +
            imageDrawSize.height

        ) {

            imagePos.dragging =
                true;


            imagePos.dragOffset = {

                x:
                    x -
                    imagePos.x,

                y:
                    y -
                    imagePos.y

            };

        }

    }
);


// =========================================================
// TOUCH MOVE
// =========================================================

canvas.addEventListener(
    'touchmove',
    (e) => {

        if (
            !imageLoaded ||
            !imagePos.dragging
        ) {

            return;

        }


        e.preventDefault();


        const rect =
            canvas.getBoundingClientRect();


        const touch =
            e.touches[0];


        const touchX =
            touch.clientX -
            rect.left;


        let newX =
            touchX -
            imagePos.dragOffset.x;


        newX =
            Math.min(
                0,
                Math.max(
                    canvas.width -
                    imageDrawSize.width,
                    newX
                )
            );


        imagePos.x =
            newX;


        drawCanvas();

    },
    {
        passive: false
    }
);


// =========================================================
// TOUCH END
// =========================================================

canvas.addEventListener(
    'touchend',
    () => {

        imagePos.dragging =
            false;

    }
);



// =========================================================
// ADS TRAY
// =========================================================

window.addEventListener(
    'load',
    () => {

        setTimeout(() => {

            const tray =
                document.getElementById(
                    'adsTray'
                );


            if (tray) {

                tray.classList.add(
                    'show'
                );

            }

        }, 800);

    }
);


// =========================================================
// CLOSE ADS TRAY
// =========================================================

function closeAdsTray() {

    const tray =
        document.getElementById(
            'adsTray'
        );


    if (tray) {

        tray.classList.remove(
            'show'
        );

    }

}
