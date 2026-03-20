document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'F5' || event.key === 'Escape') {
            event.preventDefault();
            window.location.href = '/upload';
        }
    });

    const fileListWrapper = document.getElementById('file-list-wrapper');
    const uploadRedirectButton = document.getElementById('upload-tab-btn');

    if (uploadRedirectButton) {
        uploadRedirectButton.addEventListener('click', () => window.location.href = '/upload');
    }

    let currentPage = 1;
    const perPage = 10;
    let totalImages = 0;

    const displayFiles = async () => {
        fileListWrapper.innerHTML = '';

        try {
            const response = await fetch(`/api/images?page=${currentPage}`);
            const result = await response.json();

            if (!result.success) {
                fileListWrapper.innerHTML = '<p>Error loading images</p>';
                return;
            }

            const images = result.images;
            totalImages = result.total;

            if (images.length === 0) {
                fileListWrapper.innerHTML = '<p class="upload__promt" style="text-align: center; margin-top: 50px;">No images uploaded yet.</p>';
                return;
            }

            const container = document.createElement('div');
            container.className = 'file-list-container';

            const header = document.createElement('div');
            header.className = 'file-list-header';
            header.innerHTML = `
                <div class="file-col file-col-name">Name</div>
                <div class="file-col file-col-url">Url</div>
                <div class="file-col file-col-delete">Delete</div>
            `;
            container.appendChild(header);

            const list = document.createElement('div');
            list.id = 'file-list';

            images.forEach((fileData, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-list-item';

                fileItem.innerHTML = `
                    <div class="file-col file-col-name">
                        <span class="file-icon">
                            <img src="/static/img/group.png" alt="file icon">
                        </span>

                        <span class="file-name">
                            image${String((currentPage - 1) * perPage + index + 1).padStart(2, '0')}.jpg
                        </span>
                    </div>

                    <div class="file-col file-col-url">
                        https://group6-image-hosting-server.com/${fileData.filename}
                    </div>

                    <div class="file-col file-col-delete">
                        <button class="delete-btn" data-id="${fileData.id}">
                            <img src="/static/img/delete.png" alt="delete icon">
                        </button>
                    </div>
                `;

                list.appendChild(fileItem);
            });

            container.appendChild(list);

            const totalPages = Math.ceil(totalImages / perPage);

            const pagination = document.createElement('div');
            pagination.id = 'pagination';
            pagination.style.marginTop = '20px';
            pagination.style.textAlign = 'center';

            let pagesHTML = '';

            for (let i = 1; i <= totalPages; i++) {
                pagesHTML += `
                    <button class="page-btn" data-page="${i}"
                        style="margin: 0 3px; ${i === currentPage ? 'font-weight:bold;' : ''}">
                        ${i}
                    </button>
                `;
            }

            pagination.innerHTML = `
                <button id="prev-btn" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>
                ${pagesHTML}
                <button id="next-btn" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
            `;

            container.appendChild(pagination);
            fileListWrapper.appendChild(container);

            document.getElementById('prev-btn').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayFiles();
                }
            });

            document.getElementById('next-btn').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayFiles();
                }
            });

            document.querySelectorAll('.page-btn').forEach(button => {
                button.addEventListener('click', () => {
                    currentPage = Number(button.dataset.page);
                    displayFiles();
                });
            });

            addDeleteListeners();

        } catch (error) {
            console.error('Error loading images:', error);
        }
    };

    const addDeleteListeners = () => {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const imageId = event.currentTarget.dataset.id;

                try {
                    const deleteResponse = await fetch(`/api/images/${imageId}`, {
                        method: 'DELETE'
                    });

                    const deleteResult = await deleteResponse.json();

                    if (!deleteResult.success) {
                        console.error('Failed to delete image');
                    }
                } catch (error) {
                    console.error('Error deleting image:', error);
                }

                displayFiles();
            });
        });
    };

    displayFiles();
});

