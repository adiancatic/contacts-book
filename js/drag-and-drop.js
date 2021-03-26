/*
https://soshace.com/the-ultimate-guide-to-drag-and-drop-image-uploading-with-pure-javascript/
 */

let dropRegion = document.getElementById('avatar-drop-region');
let avatarPreview = document.getElementById('avatar-preview');


let fakeInput = document.createElement('input');
fakeInput.type = 'file';
fakeInput.accept = 'image/*';
fakeInput.multiple = true; // todo set to false
dropRegion.addEventListener('click', function () {
    fakeInput.click();
});


fakeInput.addEventListener('change', function () {
    let files = fakeInput.files;
    handleFiles(files);
});


function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
}

dropRegion.addEventListener('dragenter', preventDefault, false);
dropRegion.addEventListener('dragleave', preventDefault, false);
dropRegion.addEventListener('dragover', preventDefault, false);
dropRegion.addEventListener('drop', preventDefault, false);

function handleDrop(e) {
    let data = e.dataTransfer;
    let files = data.files;
    handleFiles(files);
}

/*function handleDrop(e) {
    let dataTransfer = e.dataTransfer;
    let files = dataTransfer.files;

    if(files.length) {
        handleFiles(files)
    } else {
        let html = dataTransfer.getData('text/html');
        let match = html && /\bsrc="?([^"\s]+)"?\s*!/.exec(html);
        let url = match && match[1];

        if(url) {
            uploadImageFromURL(url);
            return;
        }
    }
}

function uploadImageFromURL(url) {
    let img = new Image;
    let c = document.createElement("canvas");
    let ctx = c.getContext("2d");

    img.onload = function() {
        c.width = this.naturalWidth;     // update canvas size to match image
        c.height = this.naturalHeight;
        ctx.drawImage(this, 0, 0);       // draw in image
        c.toBlob(function(blob) {        // get content as PNG blob

            // call our main function
            handleFiles( [blob] );

        }, "image/png");
    };
    img.onerror = function() {
        alert("Error in uploading");
    };
    img.crossOrigin = "";              // if from different origin
    img.src = url;
}*/

dropRegion.addEventListener('drop', handleDrop, false);



function handleFiles(files) {
    for (const key in files) {
        if(validateImage(files[key])) {
            previewAndUploadImage(files[key]);
        }
    }
}



function validateImage(image) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if(validTypes.indexOf(image.type) === -1) {
        alert('Invalid file type!');
        return false;
    }

    const maxSizeInBytes = 10e6;
    if(image.size > maxSizeInBytes) {
        alert('File too large!');
        return false;
    }

    return true;
}



function previewAndUploadImage(image) {
    // Container
    let imgView = document.createElement('div');
    imgView.className = 'image-view';
    avatarPreview.appendChild(imgView);

    // Previewing image
    let img = document.createElement('img');
    imgView.appendChild(img);

    // Progress overlay
    let overlay = document.createElement('div');
    overlay.className = 'overlay';
    imgView.appendChild(overlay);

    // Read image
    let reader = new FileReader();
    reader.onload = function (e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(image);

    // Create form data
    let formData = new FormData();
    formData.append('image', image);

    // Upload image
    const uploadLocation = 'photos/';

    let ajax = new XMLHttpRequest();
    ajax.open('POST', uploadLocation, true);
    ajax.withCredentials = true;
    ajax.onreadystatechange = function (e) {
        if(ajax.readyState === 4) {
            if(ajax.status === 200) {
                // Done
            } else {
                // Error
                console.log('Error: ajax img upload failed');
            }
        }
    };
    ajax.setRequestHeader('accept', "image/*");
    ajax.setRequestHeader('Access-Control-Allow-Origin', "*");
    ajax.upload.onprogress = function (e) {
        // Change progress (reduce the width of overlay)
        let perc = (e.loaded / e.total * 100) || 100;
        overlay.style.width = 100 - perc;
    };
    ajax.send(formData);
}


