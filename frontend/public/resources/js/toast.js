
export default class Toast {
    constructor(message, duration = 3000, className) {
        this.message = message;
        this.duration = duration;
        this.className = className;
        this.toast = null;

        this.show(); // Call show method to display the toast by default
    }

    show() {
        // Get toast container, creates it if does not exist
        const container = getToastContainer();
        
        //Create toast
        const toast = document.createElement('div');
        this.toast = toast;

        // Set styles
        toast.className = "toast_default";
        if (this.className) {
            // Add custom class
            toast.classList.add(this.className);
        }
        
        // Set message and show
        toast.textContent = this.message;
        container.appendChild(toast);
        
        // Animate in
        this.fadeIn();

        // Remove the toast after the specified duration
        setTimeout(() => {
            // Animate out
            this.fadeOut();

            // Remove after
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, this.duration);
    }
    
    remove() {
        document.body.removeChild(this.toast);
    }

    fadeIn() {
        requestAnimationFrame(() => {
            this.toast.style.opacity = "1";
            this.toast.style.transform = "translateY(-5px)";
        });
    }

    fadeOut() {
        requestAnimationFrame(() => {
            this.toast.style.opacity = "0";
            this.toast.style.transform = "translateY(10px)";
        })
    }
}

export function getToastContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style = defaultToastContainerStyle;

        document.body.appendChild(container);
    }
    return container;
}

const defaultToastContainerStyle = `
    position: fixed;
    right: 2%;
    bottom: 24px;

    display: flex;
    flex-direction: column;
    gap: 12px;

    z-index: 9999;
    pointer-events: none;
`;