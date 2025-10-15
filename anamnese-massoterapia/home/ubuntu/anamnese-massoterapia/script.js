// Variáveis globais
let currentStep = 1;
const totalSteps = 5;

// Elementos DOM
const form = document.getElementById('anamneseForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const successMessage = document.getElementById('successMessage');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    updateProgressBar();
    setupEventListeners();
    setupDorCondicional();
    setupCharCounter();
    setupRangeSlider();
});

// Configurar event listeners
function setupEventListeners() {
    nextBtn.addEventListener('click', nextStep);
    prevBtn.addEventListener('click', prevStep);
    form.addEventListener('submit', handleSubmit);
}

// Navegação - Próximo passo
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            // Esconder step atual
            document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
            
            // Avançar
            currentStep++;
            
            // Mostrar próximo step
            document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
            
            // Atualizar UI
            updateProgressBar();
            updateButtons();
            
            // Scroll suave para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

// Navegação - Passo anterior
function prevStep() {
    if (currentStep > 1) {
        // Esconder step atual
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        
        // Voltar
        currentStep--;
        
        // Mostrar step anterior
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        
        // Atualizar UI
        updateProgressBar();
        updateButtons();
        
        // Scroll suave para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Validar step atual
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#e63946';
            
            // Remover erro ao digitar
            field.addEventListener('input', function() {
                this.style.borderColor = '#e0e0e0';
            }, { once: true });
        }
    });
    
    if (!isValid) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
    }
    
    return isValid;
}

// Atualizar barra de progresso
function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.setProperty('--progress', `${progress}%`);
    progressBar.querySelector('::before') || (progressBar.style.width = `${progress}%`);
    
    // Atualizar usando pseudo-elemento via style
    const style = document.createElement('style');
    style.textContent = `.progress-bar::before { width: ${progress}% !important; }`;
    document.head.appendChild(style);
    
    progressText.textContent = `Etapa ${currentStep} de ${totalSteps}`;
}

// Atualizar botões
function updateButtons() {
    // Botão anterior
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-flex';
    }
    
    // Botões próximo/enviar
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }
}

// Configurar campo condicional de dor
function setupDorCondicional() {
    const dorRadios = document.querySelectorAll('input[name="dor_atual"]');
    const dorDetalhesGroup = document.getElementById('dor_detalhes_group');
    
    dorRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'sim') {
                dorDetalhesGroup.style.display = 'block';
                dorDetalhesGroup.style.animation = 'fadeIn 0.3s ease';
            } else {
                dorDetalhesGroup.style.display = 'none';
            }
        });
    });
}

// Configurar contador de caracteres
function setupCharCounter() {
    const observacoes = document.getElementById('observacoes');
    const charCount = document.getElementById('charCount');
    
    if (observacoes && charCount) {
        observacoes.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Mudar cor quando próximo do limite
            if (count > 9500) {
                charCount.style.color = '#e63946';
            } else if (count > 8000) {
                charCount.style.color = '#ff9500';
            } else {
                charCount.style.color = '#666';
            }
        });
    }
}

// Configurar range slider
function setupRangeSlider() {
    const slider = document.getElementById('dor_intensidade');
    const output = document.getElementById('dorValue');
    
    if (slider && output) {
        slider.addEventListener('input', function() {
            output.textContent = this.value;
            
            // Mudar cor baseado na intensidade
            const intensity = parseInt(this.value);
            if (intensity <= 3) {
                output.style.color = '#52b788';
            } else if (intensity <= 6) {
                output.style.color = '#ff9500';
            } else {
                output.style.color = '#e63946';
            }
        });
    }
}

// Coletar dados do formulário
function collectFormData() {
    const formData = new FormData(form);
    const data = {};
    
    // Campos simples
    for (let [key, value] of formData.entries()) {
        if (!data[key]) {
            data[key] = value;
        }
    }
    
    // Checkboxes múltiplos
    data.condicoes = Array.from(document.querySelectorAll('input[name="condicoes"]:checked'))
        .map(cb => cb.value)
        .join(', ') || 'Nenhuma';
    
    data.objetivos = Array.from(document.querySelectorAll('input[name="objetivos"]:checked'))
        .map(cb => cb.value)
        .join(', ') || 'Não especificado';
    
    return data;
}

// Formatar dados para e-mail
function formatEmailBody(data) {
    return `
NOVA ANAMNESE - FLÁVIA SILVA MASSOTERAPIA
==========================================

DADOS PESSOAIS
--------------
Nome: ${data.nome || 'Não informado'}
Idade: ${data.idade || 'Não informado'}
Telefone: ${data.telefone || 'Não informado'}
E-mail: ${data.email || 'Não informado'}
Profissão: ${data.profissao || 'Não informado'}

HISTÓRICO DE SAÚDE
------------------
Condições de Saúde: ${data.condicoes}
Medicamentos: ${data.medicamentos || 'Não informado'}
Cirurgias: ${data.cirurgia === 'sim' ? 'Sim - ' + (data.cirurgia_detalhes || 'Detalhes não informados') : 'Não'}

CONDIÇÃO FÍSICA ATUAL
---------------------
Dor Atual: ${data.dor_atual === 'sim' ? 'Sim' : 'Não'}
${data.dor_atual === 'sim' ? `Localização da Dor: ${data.dor_localizacao || 'Não especificado'}
Intensidade (0-10): ${data.dor_intensidade || 'Não informado'}` : ''}
Áreas Sensíveis: ${data.areas_sensiveis || 'Nenhuma'}
Atividade Física: ${data.atividade_fisica === 'sim' ? 'Sim - ' + (data.atividade_fisica_tipo || 'Tipo não informado') : 'Não'}

EXPERIÊNCIA COM MASSOTERAPIA
-----------------------------
Experiência Anterior: ${data.experiencia_massagem === 'sim' ? 'Sim' : 'Não'}
Tipo de Massagem Preferida: ${data.tipo_massagem_preferencia || 'Não especificado'}
Preferência de Pressão: ${data.pressao_preferencia || 'Não especificado'}
Alergia a Produtos: ${data.alergia_produtos || 'Nenhuma'}

OBJETIVOS DO TRATAMENTO
------------------------
Objetivos: ${data.objetivos}

OBSERVAÇÕES E EXPECTATIVAS
---------------------------
${data.observacoes || 'Nenhuma observação adicional'}

==========================================
Data de Envio: ${new Date().toLocaleString('pt-BR')}
    `.trim();
}

// Enviar formulário
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Desabilitar botão e mostrar loader
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').style.display = 'none';
    submitBtn.querySelector('.btn-loader').style.display = 'block';
    
    try {
        // Coletar dados
        const formData = collectFormData();
        const emailBody = formatEmailBody(formData);
        
        // Enviar via FormSubmit.co (serviço gratuito de envio de formulários)
        const response = await fetch('https://formsubmit.co/ajax/flaviasilvamassoterapeuta@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `Nova Anamnese - ${formData.nome}`,
                _template: 'box',
                _captcha: 'false',
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                mensagem: emailBody
            })
        });
        
        if (response.ok) {
            // Sucesso
            form.style.display = 'none';
            document.querySelector('.progress-container').style.display = 'none';
            successMessage.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            throw new Error('Erro ao enviar formulário');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao enviar anamnese. Por favor, entre em contato pelo WhatsApp.', 'error');
        
        // Reabilitar botão
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').style.display = 'inline';
        submitBtn.querySelector('.btn-loader').style.display = 'none';
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos inline
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#e63946' : '#52b788'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Adicionar animações de notificação ao CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Prevenir perda de dados acidental
window.addEventListener('beforeunload', function(e) {
    const formFilled = document.querySelector('input[type="text"]').value !== '';
    if (formFilled && !successMessage.style.display) {
        e.preventDefault();
        e.returnValue = '';
    }
});

