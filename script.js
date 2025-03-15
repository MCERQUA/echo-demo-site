document.addEventListener('DOMContentLoaded', function() {
    // Set creation date
    const now = new Date();
    document.getElementById('creation-date').textContent = now.toLocaleString();
});