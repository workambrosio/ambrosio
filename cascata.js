// Cascata Reservation Form - Conditional Fields Logic

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tipoServicoRadios = document.querySelectorAll('input[name="tipo-servico"]');
    const tipoEventoRadios = document.querySelectorAll('input[name="tipo-evento"]');
    const localGroup = document.getElementById('local-group');
    const localInput = document.getElementById('local');
    const outroGroup = document.getElementById('outro-group');
    const outroInput = document.getElementById('outro-descricao');
    const form = document.getElementById('reserva-form');

    // Handle Tipo de Serviço change
    tipoServicoRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'catering') {
                localGroup.classList.add('visible');
                localInput.setAttribute('required', '');
            } else {
                localGroup.classList.remove('visible');
                localInput.removeAttribute('required');
                localInput.value = '';
            }
        });
    });

    // Handle Tipo de Evento change
    tipoEventoRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'outro') {
                outroGroup.classList.add('visible');
                outroInput.setAttribute('required', '');
            } else {
                outroGroup.classList.remove('visible');
                outroInput.removeAttribute('required');
                outroInput.value = '';
            }
        });
    });

    // Set minimum date to today
    const dataInput = document.getElementById('data');
    if (dataInput) {
        const today = new Date().toISOString().split('T')[0];
        dataInput.setAttribute('min', today);
    }

    // Form submission handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Log for debugging (replace with actual submission logic)
        console.log('Form submitted:', data);
        
        // Show success message (you can replace this with actual form submission)
        alert('Pedido enviado com sucesso! Entraremos em contacto brevemente.');
        
        // Optional: Reset form after submission
        // form.reset();
        // localGroup.classList.remove('visible');
        // outroGroup.classList.remove('visible');
    });
});
