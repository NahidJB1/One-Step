/* assets/js/chatbot.js */
(function() {
    // 1. Detect relative root path for API calls
    const path = window.location.pathname.toLowerCase();
    let root = ""; 
    if (path.includes('/countries/') || path.includes('/universities/') || path.includes('/scholarship/') || path.includes('/fees_chart/') || path.includes('/articles/')) {
        root = "../";
    }

    // 2. Inject HTML structure
    const container = document.createElement('div');
    container.id = 'os-fab-container';
    container.innerHTML = `
        <div id="os-chatbot-window">
            <div class="os-chat-header">
                <h3>OS AI</h3>
                <span class="os-chat-close" id="os-chat-close">&times;</span>
            </div>
            <div id="os-chat-register" class="os-chat-register">
                <div class="os-register-content">
                    <div class="os-register-icon"><i class="fas fa-user-circle"></i></div>
                    <h4>Welcome to OS AI</h4>
                    <p>Please enter your details to start chatting</p>
                    <input type="text" id="os-reg-name" placeholder="Your Name" required>
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <select id="os-reg-country-code" style="padding: 12px 6px; border: 1px solid #e2e8f0; border-radius: 10px; font-family: inherit; font-size: 14px; outline: none; background: white; color: #333; cursor: pointer; width: 110px; flex-shrink: 0;">
                            
                            
                            <option value="+880" selected>BGD (+880)</option>
                            <option value="+93">AFG (+93)</option>
                            <option value="+355">ALB (+355)</option>
                            <option value="+213">DZA (+213)</option>
                            <option value="+1684">ASM (+1684)</option>
                            <option value="+376">AND (+376)</option>
                            <option value="+244">AGO (+244)</option>
                            <option value="+1264">AIA (+1264)</option>
                            <option value="+672">ATA (+672)</option>
                            <option value="+64">ATA (+64)</option>
                            <option value="+1268">ATG (+1268)</option>
                            <option value="+54">ARG (+54)</option>
                            <option value="+374">ARM (+374)</option>
                            <option value="+297">ABW (+297)</option>
                            <option value="+247">ASC (+247)</option>
                            <option value="+61">AUS (+61)</option>
                            <option value="+43">AUT (+43)</option>
                            <option value="+994">AZE (+994)</option>
                            <option value="+1242">BHS (+1242)</option>
                            <option value="+973">BHR (+973)</option>
                            <option value="+1246">BRB (+1246)</option>
                            <option value="+375">BLR (+375)</option>
                            <option value="+32">BEL (+32)</option>
                            <option value="+501">BLZ (+501)</option>
                            <option value="+229">BEN (+229)</option>
                            <option value="+1441">BMU (+1441)</option>
                            <option value="+975">BTN (+975)</option>
                            <option value="+591">BOL (+591)</option>
                            <option value="+387">BIH (+387)</option>
                            <option value="+267">BWA (+267)</option>
                            <option value="+55">BRA (+55)</option>
                            <option value="+1284">VGB (+1284)</option>
                            <option value="+673">BRN (+673)</option>
                            <option value="+359">BGR (+359)</option>
                            <option value="+226">BFA (+226)</option>
                            <option value="+95">MMR (+95)</option>
                            <option value="+257">BDI (+257)</option>
                            <option value="+855">KHM (+855)</option>
                            <option value="+237">CMR (+237)</option>
                            <option value="+1">CAN (+1)</option>
                            <option value="+238">CPV (+238)</option>
                            <option value="+1345">CYM (+1345)</option>
                            <option value="+236">CAF (+236)</option>
                            <option value="+235">TCD (+235)</option>
                            <option value="+56">CHL (+56)</option>
                            <option value="+86">CHN (+86)</option>
                            <option value="+57">COL (+57)</option>
                            <option value="+269">COM (+269)</option>
                            <option value="+242">COG (+242)</option>
                            <option value="+682">COK (+682)</option>
                            <option value="+506">CRC (+506)</option>
                            <option value="+385">HRV (+385)</option>
                            <option value="+53">CUB (+53)</option>
                            <option value="+357">CYP (+357)</option>
                            <option value="+420">CZE (+420)</option>
                            <option value="+243">COD (+243)</option>
                            <option value="+45">DNK (+45)</option>
                            <option value="+246">DGA (+246)</option>
                            <option value="+253">DJI (+253)</option>
                            <option value="+1767">DMA (+1767)</option>
                            <option value="+1809">DOM (+1809)</option>
                            <option value="+1829">DOM (+1829)</option>
                            <option value="+1849">DOM (+1849)</option>
                            <option value="+593">ECU (+593)</option>
                            <option value="+20">EGY (+20)</option>
                            <option value="+503">SLV (+503)</option>
                            <option value="+240">GNQ (+240)</option>
                            <option value="+291">ERI (+291)</option>
                            <option value="+372">EST (+372)</option>
                            <option value="+251">ETH (+251)</option>
                            <option value="+500">FLK (+500)</option>
                            <option value="+298">FRO (+298)</option>
                            <option value="+679">FJI (+679)</option>
                            <option value="+358">FIN (+358)</option>
                            <option value="+33">FRA (+33)</option>
                            <option value="+594">GUF (+594)</option>
                            <option value="+689">PYF (+689)</option>
                            <option value="+241">GAB (+241)</option>
                            <option value="+220">GMB (+220)</option>
                            <option value="+995">GEO (+995)</option>
                            <option value="+49">DEU (+49)</option>
                            <option value="+233">GHA (+233)</option>
                            <option value="+350">GIB (+350)</option>
                            <option value="+30">GRC (+30)</option>
                            <option value="+299">GRL (+299)</option>
                            <option value="+1473">GRD (+1473)</option>
                            <option value="+590">GLP (+590)</option>
                            <option value="+1671">GUM (+1671)</option>
                            <option value="+502">GTM (+502)</option>
                            <option value="+224">GIN (+224)</option>
                            <option value="+245">GNB (+245)</option>
                            <option value="+592">GUY (+592)</option>
                            <option value="+509">HTI (+509)</option>
                            <option value="+39">VAT (+39)</option>
                            <option value="+504">HND (+504)</option>
                            <option value="+852">HKG (+852)</option>
                            <option value="+36">HUN (+36)</option>
                            <option value="+354">ISL (+354)</option>
                            <option value="+91">IND (+91)</option>
                            <option value="+62">IDN (+62)</option>
                            <option value="+98">IRN (+98)</option>
                            <option value="+964">IRQ (+964)</option>
                            <option value="+353">IRL (+353)</option>
                            <option value="+44">IMN (+44)</option>
                            <option value="+972">ISR (+972)</option>
                            <option value="+225">CIV (+225)</option>
                            <option value="+1876">JAM (+1876)</option>
                            <option value="+81">JPN (+81)</option>
                            <option value="+962">JOR (+962)</option>
                            <option value="+7">KAZ (+7)</option>
                            <option value="+254">KEN (+254)</option>
                            <option value="+686">KIR (+686)</option>
                            <option value="+965">KWT (+965)</option>
                            <option value="+996">KGZ (+996)</option>
                            <option value="+856">LAO (+856)</option>
                            <option value="+371">LVA (+371)</option>
                            <option value="+961">LBN (+961)</option>
                            <option value="+266">LSO (+266)</option>
                            <option value="+231">LBR (+231)</option>
                            <option value="+218">LBY (+218)</option>
                            <option value="+423">LIE (+423)</option>
                            <option value="+370">LTU (+370)</option>
                            <option value="+352">LUX (+352)</option>
                            <option value="+853">MAC (+853)</option>
                            <option value="+389">MKD (+389)</option>
                            <option value="+261">MDG (+261)</option>
                            <option value="+265">MWI (+265)</option>
                            <option value="+60">MYS (+60)</option>
                            <option value="+960">MDV (+960)</option>
                            <option value="+223">MLI (+223)</option>
                            <option value="+356">MLT (+356)</option>
                            <option value="+692">MHL (+692)</option>
                            <option value="+596">MTQ (+596)</option>
                            <option value="+222">MRT (+222)</option>
                            <option value="+230">MUS (+230)</option>
                            <option value="+262">MYT (+262)</option>
                            <option value="+52">MEX (+52)</option>
                            <option value="+691">FSM (+691)</option>
                            <option value="+373">MDA (+373)</option>
                            <option value="+377">MCO (+377)</option>
                            <option value="+976">MNG (+976)</option>
                            <option value="+382">MNE (+382)</option>
                            <option value="+1664">MSR (+1664)</option>
                            <option value="+212">MAR (+212)</option>
                            <option value="+258">MOZ (+258)</option>
                            <option value="+264">NAM (+264)</option>
                            <option value="+674">NRU (+674)</option>
                            <option value="+977">NPL (+977)</option>
                            <option value="+31">NLD (+31)</option>
                            <option value="+599">ANT (+599)</option>
                            <option value="+687">NCL (+687)</option>
                            <option value="+505">NIC (+505)</option>
                            <option value="+227">NER (+227)</option>
                            <option value="+234">NGA (+234)</option>
                            <option value="+683">NIU (+683)</option>
                            <option value="+850">PRK (+850)</option>
                            <option value="+1670">MNP (+1670)</option>
                            <option value="+47">NOR (+47)</option>
                            <option value="+968">OMN (+968)</option>
                            <option value="+92">PAK (+92)</option>
                            <option value="+680">PLW (+680)</option>
                            <option value="+970">PSE (+970)</option>
                            <option value="+507">PAN (+507)</option>
                            <option value="+675">PNG (+675)</option>
                            <option value="+595">PRY (+595)</option>
                            <option value="+51">PER (+51)</option>
                            <option value="+63">PHL (+63)</option>
                            <option value="+870">PCN (+870)</option>
                            <option value="+48">POL (+48)</option>
                            <option value="+351">PRT (+351)</option>
                            <option value="+1787">PRI (+1787)</option>
                            <option value="+1939">PRI (+1939)</option>
                            <option value="+974">QAT (+974)</option>
                            <option value="+40">ROU (+40)</option>
                            <option value="+250">RWA (+250)</option>
                            <option value="+290">SHN (+290)</option>
                            <option value="+1869">KNA (+1869)</option>
                            <option value="+1758">LCA (+1758)</option>
                            <option value="+508">SPM (+508)</option>
                            <option value="+1784">VCT (+1784)</option>
                            <option value="+685">WSM (+685)</option>
                            <option value="+378">SMR (+378)</option>
                            <option value="+239">STP (+239)</option>
                            <option value="+966">SAU (+966)</option>
                            <option value="+221">SEN (+221)</option>
                            <option value="+381">SRB (+381)</option>
                            <option value="+248">SYC (+248)</option>
                            <option value="+232">SLE (+232)</option>
                            <option value="+65">SGP (+65)</option>
                            <option value="+1721">SXM (+1721)</option>
                            <option value="+421">SVK (+421)</option>
                            <option value="+386">SVN (+386)</option>
                            <option value="+677">SLB (+677)</option>
                            <option value="+252">SOM (+252)</option>
                            <option value="+27">ZAF (+27)</option>
                            <option value="+82">KOR (+82)</option>
                            <option value="+211">SSD (+211)</option>
                            <option value="+34">ESP (+34)</option>
                            <option value="+94">LKA (+94)</option>
                            <option value="+249">SDN (+249)</option>
                            <option value="+597">SUR (+597)</option>
                            <option value="+268">SWZ (+268)</option>
                            <option value="+46">SWE (+46)</option>
                            <option value="+41">CHE (+41)</option>
                            <option value="+963">SYR (+963)</option>
                            <option value="+886">TWN (+886)</option>
                            <option value="+992">TJK (+992)</option>
                            <option value="+255">TZA (+255)</option>
                            <option value="+66">THA (+66)</option>
                            <option value="+670">TLS (+670)</option>
                            <option value="+228">TGO (+228)</option>
                            <option value="+690">TKL (+690)</option>
                            <option value="+676">TON (+676)</option>
                            <option value="+1868">TTO (+1868)</option>
                            <option value="+216">TUN (+216)</option>
                            <option value="+90">TUR (+90)</option>
                            <option value="+993">TKM (+993)</option>
                            <option value="+1649">TCA (+1649)</option>
                            <option value="+688">TUV (+688)</option>
                            <option value="+256">UGA (+256)</option>
                            <option value="+380">UKR (+380)</option>
                            <option value="+971">ARE (+971)</option>
                            <option value="+598">URY (+598)</option>
                            <option value="+1340">VIR (+1340)</option>
                            <option value="+998">UZB (+998)</option>
                            <option value="+678">VUT (+678)</option>
                            <option value="+58">VEN (+58)</option>
                            <option value="+84">VNM (+84)</option>
                            <option value="+681">WLF (+681)</option>
                            <option value="+967">YEM (+967)</option>
                            <option value="+260">ZMB (+260)</option>
                            <option value="+263">ZWE (+263)</option>
                        </select>
                        <input type="tel" id="os-reg-phone" placeholder="Phone Number" required style="margin-bottom: 0; flex: 1; min-width: 0;">
                    </div>
                    <button id="os-reg-submit">Start Chatting <i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
            <div class="os-chat-messages" id="os-chat-messages"></div>
            <div class="os-chat-input-area">
                <input type="text" id="os-chat-input" placeholder="Ask about universities, fees..." aria-label="Your question" maxlength="2000" autocomplete="off">
                <button id="os-chat-send" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
        
        <div class="os-fab-menu">
            <a href="https://wa.me/601119359497" target="_blank" class="os-fab-item os-fab-whatsapp" data-tooltip="WhatsApp">
                <i class="fab fa-whatsapp"></i>
            </a>
            <div class="os-fab-item os-fab-bot" id="os-fab-bot-btn" data-tooltip="AI Assistant">
                <i class="fas fa-robot"></i>
            </div>
        </div>
        
        <div id="os-fab-toggle">
            <i class="fas fa-comment-dots"></i>
        </div>
    `;
    document.body.appendChild(container);

    // 3. UI Elements
    const fabToggle = document.getElementById('os-fab-toggle');
    const fabContainer = document.getElementById('os-fab-container');
    const fabBotBtn = document.getElementById('os-fab-bot-btn');
    const closeBtn = document.getElementById('os-chat-close');
    const chatWindow = document.getElementById('os-chatbot-window');
    const chatMessages = document.getElementById('os-chat-messages');
    const chatInput = document.getElementById('os-chat-input');
    const sendBtn = document.getElementById('os-chat-send');
    const chatOption = document.getElementById('os-fab-bot-btn');

    let chatHistory = [];
    let botContext = {};

    // 4. Load history and context from sessionStorage
    const savedHistory = readSession('os_chat_history');
    const savedContext = readSession('os_chat_context');
    if (savedHistory) {
        try {
            const parsed = JSON.parse(savedHistory);
            chatHistory = Array.isArray(parsed) ? parsed.filter(msg => msg && ['user', 'bot'].includes(msg.role) && typeof msg.text === 'string').slice(-40) : [];
            chatHistory.forEach(msg => appendMessage(msg.role, msg.text, false, msg.matched_q || null, msg.buttons || null, msg.sources || []));
        } catch(e) { console.error('Error parsing chat history'); }
    } else {
        // No saved history â€” greeting will be shown by the registration handler
        // or on next open if user is already registered
    }
    if (savedContext) {
        try { const parsed = JSON.parse(savedContext); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) botContext = parsed; } catch(e) {}
    }

    // 5. Event Listeners
    fabToggle.addEventListener('click', () => {
        fabContainer.classList.toggle('os-fab-open');
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('os-chat-open');
        fabToggle.style.display = 'flex';
        fabToggle.innerHTML = '<i class="fas fa-comment-dots"></i>';
        document.body.style.overflow = '';
    });

    chatOption.addEventListener('click', () => {
        chatWindow.classList.add('os-chat-open');
        fabContainer.classList.remove('os-fab-open');
        fabToggle.style.display = 'none';
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        }
        const sessionId = readSession('os_chat_session_id');
        if (!sessionId) {
            // Show registration, hide chat
            document.getElementById('os-chat-register').style.display = 'flex';
            document.getElementById('os-chat-messages').style.display = 'none';
            document.querySelector('.os-chat-input-area').style.display = 'none';
            setTimeout(() => document.getElementById('os-reg-name').focus(), 100);
        } else {
            document.getElementById('os-chat-register').style.display = 'none';
            document.getElementById('os-chat-messages').style.display = 'flex';
            document.querySelector('.os-chat-input-area').style.display = 'flex';
            // Show greeting for returning users with no loaded history
            if (chatHistory.length === 0) {
                const userName = readSession('os_chat_user_name') || 'there';
                const greeting = `Hi ${userName}! I'm OS AI. How can I help you with universities, programs, or fees today?`;
                appendMessage('bot', greeting, false);
                chatHistory.push({ role: 'bot', text: greeting });
                saveHistory();
            }
            chatInput.focus();
        }
    });

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Registration form handler
    document.getElementById('os-reg-submit').addEventListener('click', async () => {
        const nameInput = document.getElementById('os-reg-name');
        const phoneInput = document.getElementById('os-reg-phone');
        const countryCode = document.getElementById('os-reg-country-code').value;
        const name = nameInput.value.trim();
        const phoneRaw = phoneInput.value.trim();
        
        // Validation: Name must contain letters (no digits), Phone must be digits only
        const nameRegex = /^[^0-9]+$/; // No numbers allowed
        const phoneRegex = /^\d+$/; // Only digits allowed

        if (!name || !nameRegex.test(name)) { 
            nameInput.style.borderColor = '#ef4444'; 
            nameInput.value = ''; 
            nameInput.placeholder = 'Please enter a valid name (letters only)'; 
            nameInput.focus(); 
            return; 
        } else {
            nameInput.style.borderColor = '#e2e8f0';
        }

        if (!phoneRaw || !phoneRegex.test(phoneRaw)) { 
            phoneInput.style.borderColor = '#ef4444'; 
            phoneInput.value = ''; 
            phoneInput.placeholder = 'Numbers only (e.g. 1712345678)'; 
            phoneInput.focus(); 
            return; 
        } else {
            phoneInput.style.borderColor = '#e2e8f0';
        }

        const phone = countryCode + phoneRaw;
        
        const submitBtn = document.getElementById('os-reg-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connecting...';
        
        try {
            const res = await fetch(root + 'api/save_chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start_session', user_name: name, phone: phone })
            });
            const data = await res.json();
            if (data.session_id) {
                writeSession('os_chat_session_id', String(data.session_id));
                writeSession('os_chat_user_name', name);
                // Hide registration, show chat
                document.getElementById('os-chat-register').style.display = 'none';
                document.getElementById('os-chat-messages').style.display = 'flex';
                document.querySelector('.os-chat-input-area').style.display = 'flex';
                // Show personalized greeting
                const greeting = `Hi ${name}! I'm OS AI. How can I help you with universities, programs, or fees today?`;
                appendMessage('bot', greeting, false);
                chatHistory = [{ role: 'bot', text: greeting }];
                saveHistory();
                chatInput.focus();
            } else {
                throw new Error(data.error || 'Failed to start session');
            }
        } catch (err) {
            console.error('Registration error:', err);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Start Chatting <i class="fas fa-arrow-right"></i>';
            alert('Could not connect. Please try again.');
        }
    });

    // Allow Enter key on phone field to submit registration
    document.getElementById('os-reg-phone').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('os-reg-submit').click();
    });
    document.getElementById('os-reg-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('os-reg-phone').focus();
    });

    let isFetching = false;

    // 6. Send Message Logic
    async function sendMessage() {
        if (isFetching) return;
        const text = chatInput.value.trim();
        if (!text) return;

        isFetching = true;
        chatInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.style.opacity = '0.5';

        // Add user message
        appendMessage('user', text);
        chatHistory.push({ role: 'user', text: text });
        saveChatMessage('user', text);
        saveHistory();
        chatInput.value = '';

        // Show typing indicator
        showTyping();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        try {
            const response = await fetch(root + 'api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({ 
                    message: text, 
                    context: botContext
                })
            });
            
            removeTyping();

            if (!response.ok) {
                // Try to get detailed error from PHP
                let errData = {};
                try { errData = await response.json(); } catch(e) {}
                console.error("Chat API failed with status:", response.status, errData);
                throw new Error(errData.details || errData.error || 'Server returned ' + response.status + '. Make sure you are running this on a web server (like XAMPP or Live Server), not via file:// protocol.');
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            const replyText = data.reply || "Sorry, I couldn't process that.";
            const matchedQ = data.matched_q || null;
            const buttons = data.buttons || null;
            const sources = Array.isArray(data.sources) ? data.sources : [];
            if (data.context && typeof data.context === 'object' && !Array.isArray(data.context)) {
                botContext = data.context;
                writeSession('os_chat_context', JSON.stringify(botContext));
            }
            
            appendMessage('bot', replyText, true, matchedQ, buttons, sources);
            chatHistory.push({ role: 'bot', text: replyText, matched_q: matchedQ, buttons: buttons, sources: sources });
            saveChatMessage('bot', replyText);
            saveHistory();
            
            if (data.suggestions && data.suggestions.length > 0) {
                renderSuggestions(data.suggestions);
            }

            setTimeout(() => chatInput.focus(), 100);

        } catch (error) {
            console.error('Chat API Error:', error);
            removeTyping();
            
            // Check if it's likely a file:// protocol issue
            let errorMsg = "Sorry, I'm having trouble connecting to the server. Please try again later.";
            if (window.location.protocol === 'file:') {
                errorMsg = "Error: You are viewing this site directly from your hard drive (`file://`). PHP scripts like the Chatbot require a local web server (e.g., XAMPP, WAMP, or VS Code Live Server with PHP) to function.";
            } else if (error.message) {
                // If it's a specific backend error, show part of it
                errorMsg = "Connection error: " + error.message;
            }
            
            appendMessage('bot', errorMsg);
        } finally {
            clearTimeout(timeout);
            removeTyping();
            isFetching = false;
            chatInput.disabled = false;
            sendBtn.disabled = false;
            sendBtn.style.opacity = '1';
        }
    }

    // 7. Helpers
    function renderSuggestions(suggestions) {
        chatMessages.querySelectorAll('.os-suggestions-wrapper').forEach(el => el.remove());
        const wrapper = document.createElement('div');
        wrapper.className = 'os-suggestions-wrapper';
        
        suggestions.forEach(q => {
            const btn = document.createElement('button');
            btn.className = 'os-suggestion-chip';
            btn.textContent = q;
            btn.addEventListener('click', () => {
                // Remove suggestions once one is clicked
                wrapper.remove();
                chatInput.value = q;
                sendMessage();
            });
            wrapper.appendChild(btn);
        });
        
        chatMessages.appendChild(wrapper);
        scrollToBottom();
    }
    
    function appendMessage(role, text, animate = true, matchedQ = null, buttons = null, sources = []) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `os-message ${role}`;
        
        if (role === 'bot') {
            msgDiv.innerHTML = parseMarkdown(text);
            
            if (buttons && buttons.length > 0) {
                const btnContainer = document.createElement('div');
                btnContainer.className = 'os-bot-buttons';
                buttons.forEach(btn => {
                    const a = document.createElement('a');
                    const url = safeUrl(btn.url);
                    if (!url) return;
                    a.href = url;
                    a.className = ['os-wa-btn', 'os-fee-btn', 'os-details-btn'].includes(btn.class) ? btn.class : 'os-details-btn';
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.textContent = btn.label;
                    btnContainer.appendChild(a);
                });
                msgDiv.appendChild(btnContainer);
            }
            const distinctSources = [...new Map(sources.filter(source => source && typeof source.url === 'string').map(source => [source.url, source])).values()];
            if (distinctSources.length) {
                const details = document.createElement('details');
                details.className = 'os-chat-sources';
                const summary = document.createElement('summary');
                summary.textContent = 'Sources';
                details.appendChild(summary);
                distinctSources.forEach(source => {
                    const url = safeUrl(source.url);
                    if (!url) return;
                    const link = document.createElement('a');
                    link.href = url;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = source.title || source.file || 'Local source';
                    details.appendChild(link);
                    details.appendChild(document.createElement('br'));
                });
                msgDiv.appendChild(details);
            }
            
            // Add Feedback Action Bar
            const actionBar = document.createElement('div');
            actionBar.className = 'os-bot-actions';
            
            actionBar.innerHTML = `
                <button class="os-action-btn os-copy-btn" title="Copy"><i class="fas fa-copy"></i></button>
                ${matchedQ ? `
                <button class="os-action-btn os-like-btn" title="Helpful"><i class="fas fa-thumbs-up"></i></button>
                <button class="os-action-btn os-dislike-btn" title="Not helpful"><i class="fas fa-thumbs-down"></i></button>
                ` : ''}
            `;
            
            // Event Listeners for actions
            const copyBtn = actionBar.querySelector('.os-copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(text);
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i>', 2000);
                });
            }
            
            const likeBtn = actionBar.querySelector('.os-like-btn');
            const dislikeBtn = actionBar.querySelector('.os-dislike-btn');
            
            if (likeBtn && dislikeBtn) {
                let currentFeedback = null;
                
                likeBtn.addEventListener('click', () => {
                    if (currentFeedback === 'like') {
                        sendFeedback(matchedQ, 'remove_like');
                        likeBtn.classList.remove('active');
                        currentFeedback = null;
                    } else {
                        sendFeedback(matchedQ, 'like', currentFeedback);
                        likeBtn.classList.add('active');
                        dislikeBtn.classList.remove('active');
                        currentFeedback = 'like';
                    }
                });
                dislikeBtn.addEventListener('click', () => {
                    if (currentFeedback === 'dislike') {
                        sendFeedback(matchedQ, 'remove_dislike');
                        dislikeBtn.classList.remove('active');
                        currentFeedback = null;
                    } else {
                        sendFeedback(matchedQ, 'dislike', currentFeedback);
                        dislikeBtn.classList.add('active');
                        likeBtn.classList.remove('active');
                        currentFeedback = 'dislike';
                    }
                });
            }
            
            msgDiv.appendChild(actionBar);
        } else {
            msgDiv.textContent = text; // user text is safe
        }

        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }
    
    function sendFeedback(question, action, previousAction = null) {
        fetch(root + 'api/log_feedback.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question, action: action, previous_action: previousAction })
        }).catch(e => console.error('Feedback error', e));
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'os-typing-indicator';
        div.id = 'os-typing';
        div.innerHTML = `<div class="os-typing-dot"></div><div class="os-typing-dot"></div><div class="os-typing-dot"></div>`;
        chatMessages.appendChild(div);
        scrollToBottom();
    }

    function removeTyping() {
        const typing = document.getElementById('os-typing');
        if (typing) typing.remove();
    }

    function scrollToBottom() {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 10);
    }

    function saveHistory() {
        chatHistory = chatHistory.slice(-40);
        writeSession('os_chat_history', JSON.stringify(chatHistory));
    }

    function saveChatMessage(role, text) {
        const sessionId = readSession('os_chat_session_id');
        if (!sessionId) return;
        fetch(root + 'api/save_chat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_message', session_id: parseInt(sessionId), role: role, message: text })
        }).catch(e => console.error('Save chat error', e));
    }

    function readSession(key) {
        try { return localStorage.getItem(key); } catch (_) { return null; }
    }

    function writeSession(key, value) {
        try { localStorage.setItem(key, value); } catch (_) { /* Chat works without browser storage. */ }
    }

    function safeUrl(value) {
        if (typeof value !== 'string' || /[\u0000-\u001f<>"']/.test(value)) return null;
        try {
            // New API paths are project-relative, including on nested pages/subdirectory installs.
            const base = new URL(root || './', window.location.href);
            const url = new URL(value, base);
            // Older API responses name HTML files; render only known public pages
            // as clean URLs. Keep external links, downloads and API paths intact.
            if (url.origin === base.origin && url.pathname.startsWith(base.pathname)) {
                const page = url.pathname.slice(base.pathname.length);
                if (/^(?:Universities\/[^/]+-details|Fees_Chart\/[^/]+-fees|Articles\/[^/]+|countries\/[^/]+|explore-universities)\.html$/.test(page)) {
                    url.pathname = base.pathname + page.slice(0, -5);
                }
                if (url.pathname === base.pathname + 'Fees_Chart/city-university-fees') {
                    url.pathname = base.pathname + 'Universities/cityu-university';
                    url.hash = 'courses-fees';
                }
            }
            return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
        } catch (_) { return null; }
    }

    // Basic Markdown Parser for Bot Responses
    function parseMarkdown(text) {
        // 1. Escape HTML to prevent injection
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 2. Process line by line for structured output
        const lines = html.split('\n');
        let output = '';
        let inBlockquote = false;
          let inTable = false;
        let blockquoteContent = '';

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            
            // Table processing
            if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    output += '<div class="table-responsive"><table class="table table-bordered os-bot-table" style="font-size:0.85rem; margin-bottom:10px;">';
                }
                if (line.includes('---')) {
                    continue; // Skip separator line
                }
                const cells = line.split('|').slice(1, -1).map(c => applyInline(c.trim()));
                // if it's the first row, maybe make it th
                if (output.endsWith('margin-bottom:10px;">')) {
                    output += '<tr>' + cells.map(c => '<th style="background:#f1f5f9; padding:8px;">' + c + '</th>').join('') + '</tr>';
                } else {
                    output += '<tr>' + cells.map(c => '<td style="padding:8px;">' + c + '</td>').join('') + '</tr>';
                }
                continue;
            } else if (inTable) {
                inTable = false;
                output += '</table></div>';
            }

            // Blockquote lines (> text) â€” collect them
            if (line.trim().startsWith('&gt;')) {
                if (!inBlockquote) { inBlockquote = true; blockquoteContent = ''; }
                blockquoteContent += line.replace(/^(\s*&gt;\s?)/, '') + '\n';
                continue;
            } else if (inBlockquote) {
                // Flush blockquote
                inBlockquote = false;
                const bqLines = blockquoteContent.trim().split('\n').map(l => {
                    l = applyInline(l);
                    return l ? `<span class="os-remark-line">${l}</span>` : '';
                }).filter(Boolean).join('');
                output += `<div class="os-remark-box">${bqLines}</div>`;
                blockquoteContent = '';
            }

            // â†³ detail line â€” break pipes into stacked key:value rows
            if (line.trim().startsWith('&#8627;') || line.includes('\u2197') || line.trim().startsWith('&amp;#8627') || line.includes('\u21b3')) {
                const detailPart = line.replace(/^\s*[â†³â†—â¤·]\s*/, '').trim();
                const parts = detailPart.split('|').map(p => p.trim()).filter(Boolean);
                if (parts.length > 0) {
                    const rows = parts.map(p => {
                        p = applyInline(p);
                        return `<span class="os-detail-item">${p}</span>`;
                    }).join('');
                    output += `<div class="os-detail-row">${rows}</div>`;
                }
                continue;
            }

            // â†³ detail line using actual arrow character
            if (line.includes('â†³')) {
                const detailPart = line.replace(/.*â†³\s*/, '').trim();
                const parts = detailPart.split('|').map(p => p.trim()).filter(Boolean);
                if (parts.length > 0) {
                    const rows = parts.map(p => {
                        p = applyInline(p);
                        return `<span class="os-detail-item">${p}</span>`;
                    }).join('');
                    output += `<div class="os-detail-row">${rows}</div>`;
                }
                continue;
            }

            // Bullet list item (- **Name**)
            if (line.trim().match(/^-\s+/)) {
                const content = applyInline(line.trim().replace(/^-\s+/, ''));
                output += `<div class="os-list-item">${content}</div>`;
                continue;
            }

            // Section header (*FACULTY OF ...*) â€” italic all-caps heading
            if (line.trim().match(/^\*[A-Z0-9 &()\/\-]+\*$/)) {
                const headerText = applyInline(line.trim());
                output += `<div class="os-section-header">${headerText}</div>`;
                continue;
            }

            // University title (UNIVERSITY NAME FEES:)
            if (line.trim().match(/FEES:$/)) {
                output += `<div class="os-uni-title">${applyInline(line.trim())}</div>`;
                continue;
            }

            // Horizontal rule
            if (line.trim() === '---' || line.trim() === '***') {
                output += `<hr class="os-divider">`;
                continue;
            }

            // Empty line = spacer
            if (line.trim() === '') {
                output += `<div class="os-spacer"></div>`;
                continue;
            }

            // Regular paragraph
            output += `<p>${applyInline(line.trim())}</p>`;
        }

        // Flush any remaining blockquote
        if (inTable) output += '</table></div>';
        if (inBlockquote && blockquoteContent.trim()) {
            const bqLines = blockquoteContent.trim().split('\n').map(l => {
                l = applyInline(l);
                return l ? `<span class="os-remark-line">${l}</span>` : '';
            }).filter(Boolean).join('');
            output += `<div class="os-remark-box">${bqLines}</div>`;
        }

        return output;
    }

    function applyInline(text) {
        // Bold **text**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic *text*
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Links [label](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, value) => {
            const url = safeUrl(value.replace(/&amp;/g, '&'));
            return url ? `<a href="${url.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="os-link">${label}</a>` : label;
        });
        return text;
    }
})();

