// Set today's date as minimum for date input
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('journeyDate').setAttribute('min', today);
        document.getElementById('journeyDate').value = today;

        // Hamburger menu toggle
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');

        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Swap cities function
        function swapCities() {
            const fromCity = document.getElementById('fromCity');
            const toCity = document.getElementById('toCity');
            const temp = fromCity.value;
            fromCity.value = toCity.value;
            toCity.value = temp;
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            } else {
                navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
            }
        });

        // Search tabs functionality
        const searchTabs = document.querySelectorAll('.search-tab');
        searchTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                searchTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Form submission
        document.querySelector('.search-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Searching for buses... This is a demo interface!');
        });

        // Newsletter submission
        document.querySelector('.newsletter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing to our newsletter!');
        });

        





        //from here starts the manage booking code//


         // Hamburger menu toggle
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');

        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const ticketId = document.getElementById('ticketId').value;
            const contact = document.getElementById('contact').value;

            // Simulate booking retrieval
            if (ticketId && contact) {
                // Show booking details
                document.getElementById('bookingDetails').classList.add('active');
                document.getElementById('emptyState').classList.remove('active');
                
                // Smooth scroll to details
                setTimeout(() => {
                    document.getElementById('bookingDetails').scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 100);
            } else {
                // Show empty state
                document.getElementById('bookingDetails').classList.remove('active');
                document.getElementById('emptyState').classList.add('active');
                
                // Smooth scroll to empty state
                setTimeout(() => {
                    document.getElementById('emptyState').scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 100);
            }
        });

        // FAQ Toggle
        function toggleFAQ(element) {
            const faqItem = element.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked FAQ if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        }

        // Download Ticket
        function downloadTicket() {
            // Simulate ticket download
            alert('Downloading your e-ticket...\n\nYour ticket has been downloaded successfully!\n\nTicket ID: BUS123456789\nRoute: Mumbai → Pune\nDate: 25 Jan 2026\n\nThis is a paperless M-Ticket. Show this on your mobile during boarding.');
        }

        // Reschedule Booking
        function rescheduleBooking() {
            alert('Reschedule Feature\n\nYou can reschedule your journey to a different date.\n\nRescheduling charges: ₹100 + fare difference (if any)\n\nThis feature will redirect you to the reschedule page.');
        }

        // Open Cancel Modal
        function openCancelModal() {
            document.getElementById('cancelModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Close Cancel Modal
        function closeCancelModal() {
            document.getElementById('cancelModal').classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Confirm Cancellation
        function confirmCancellation() {
            // Simulate cancellation
            alert('Booking Cancelled Successfully!\n\nRefund Amount: ₹847.87\n\nThe refund will be processed to your original payment method within 5-7 business days.\n\nCancellation ID: CAN123456789');
            
            // Update booking status
            const statusBadge = document.querySelector('.status-badge');
            statusBadge.className = 'status-badge status-cancelled';
            statusBadge.innerHTML = '<i class="fas fa-times-circle"></i> Cancelled';
            
            // Disable action buttons
            const actionButtons = document.querySelectorAll('.action-btn');
            actionButtons.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
            
            closeCancelModal();
        }

        // Close modal when clicking outside
        document.getElementById('cancelModal').addEventListener('click', (e) => {
            if (e.target.id === 'cancelModal') {
                closeCancelModal();
            }
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            } else {
                navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
            }
        });

        // Auto-focus on ticket ID input
        document.getElementById('ticketId').focus();