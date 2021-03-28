/*
https://soshace.com/the-ultimate-guide-to-drag-and-drop-image-uploading-with-pure-javascript/
 security.fileuri.strict_origin_policy
 */

let dropRegion = document.getElementById('avatar-drop-region');
let avatarPreview = document.getElementById('avatar-preview');


let fakeInput = document.createElement('input');
fakeInput.type = 'file';
fakeInput.accept = 'image/*';
fakeInput.multiple = false;

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

dropRegion.addEventListener('drop', handleDrop, false);



function handleFiles(files) {
    files = [files[0]];
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



/*function previewAndUploadImage(image) {
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

    console.log(formData);

    // Upload image
    const uploadLocation = 'photos/';

    let ajax = new XMLHttpRequest();
    ajax.open('POST', uploadLocation, true);

    ajax.onreadystatechange = function (e) {
        if(ajax.readyState === 4) {
            if(ajax.status === 200) {
                // Done
                console.log('success');
            } else {
                // Error
                console.log('Error: ajax img upload failed');
            }
        }
    };

    console.log('test');

    ajax.upload.onprogress = function (e) {
        // Change progress (reduce the width of overlay)
        let perc = (e.loaded / e.total * 100) || 100;
        overlay.style.width = 100 - perc;
    };
    ajax.send(formData);
}*/

function previewAndUploadImage(image) {

    // container
    let imgView = document.createElement("div");
    imgView.className = "image-view";
    avatarPreview.appendChild(imgView);

    // previewing image
    let img = document.createElement("img");
    imgView.appendChild(img);

    // progress overlay
    let overlay = document.createElement("div");
    overlay.className = "overlay";
    imgView.appendChild(overlay);


    // read the image...
    let reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;

        // let imageField = document.createElement('input');
        // imageField.type = 'hidden';
        // imageField.name = 'avatar';
        // imageField.value = e.target.result;
        // $('#add-contact-form').append(imageField);
    };
    reader.readAsDataURL(image);


    // create FormData
    let formData = new FormData();
    formData.append('image', image);

    // upload the image
    const uploadLocation = 'photos/';

    let ajax = new XMLHttpRequest();
    ajax.open("POST", uploadLocation, true);

    ajax.onreadystatechange = function(e) {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                // done!
            } else {
                // error!
            }
        }
    };

    ajax.upload.onprogress = function(e) {

        // change progress
        // (reduce the width of overlay)

        let perc = (e.loaded / e.total * 100) || 100,
            width = 100 - perc;

        overlay.style.width = width;
    };

    ajax.send(formData);

}

