$jsonFile = "data/fees_data.json"
$data = Get-Content $jsonFile | ConvertFrom-Json

$bac = @{
    id = "bac"
    title = "BAC EDUCATION GROUP"
    subtitle = "International Fee Structure 2026"
    validity = "Valid from 1st January 2026 until 31st December 2026"
    logo = "../assets/images/universities/bac/bac-logo.png"
    theme = @{
        theme_color = "#D41243"
        theme_dark = "#9e0c31"
        theme_accent = "#FFB81C"
        theme_light = "#fff0f3"
    }
    categories = @(
        @{
            category_name = "UNIMY"
            pdf_link = "bac-fees"
            remarks = "<strong>Other Fees:</strong><br>EMGS & Application Fee: RM4,800 (Non-refundable)<br>Visa Renewal Fee: RM1,200 / year (Non-refundable)<br>Resource Fee: RM1,000 / year (Non-refundable)<br><br><strong>Intakes Calendar:</strong><br>Pre-University Programs: Feb, May, Sep<br>Undergraduate Programs: Feb, May, Sep<br>Bachelor of Computer Engineering: May, Sep<br>Postgraduate Programs: Feb, May, Sep (Course Work); Open throughout the year (Research)"
            table = @{
                headers = @("No", "Programme", "Duration", "Tuition Fees (1st Year)", "Tuition Fees (Following Years)", "Total Tuition Fee")
                rows = @(
                    @("1", "Foundation in Computing & Engineering", "1 year", "RM17,168", "-", "RM17,168"),
                    @("2", "Diploma in Information Technology (Cybersecurity)", "2.5 years", "RM16,168", "RM13,000", "RM29,168"),
                    @("3", "Diploma in Game Development", "3 years", "RM16,168", "RM13,000", "RM29,168"),
                    @("4", "Diploma in Interactive & Digital Media", "3 years", "RM16,168", "RM13,000", "RM29,168"),
                    @("5", "Diploma in Robotic & Automation", "3 years", "RM16,168", "RM13,000", "RM29,168"),
                    @("6", "Diploma in Digital Marketing", "3 years", "RM16,168", "RM13,000", "RM29,168"),
                    @("7", "Bachelor of Multimedia (Interactive Media)", "3 years", "RM16,168", "RM15,000 / 2nd & 3rd year", "RM46,168"),
                    @("8", "Bachelor of Computer Science (Data Science)", "3 years", "RM16,168", "RM15,000 / 2nd & 3rd year", "RM46,168"),
                    @("9", "Bachelor of Game Development (Game Technology)", "3 years", "RM16,168", "RM15,000 / 2nd & 3rd year", "RM46,168"),
                    @("10", "Bachelor of Computer Science (Honours)", "3 years", "RM16,168", "RM15,000 / 2nd & 3rd year", "RM46,168"),
                    @("11", "Bachelor of Software Engineering (Honours)", "3 years", "RM16,168", "RM15,000 / 2nd & 3rd year", "RM46,168"),
                    @("12", "Bachelor of Computer Engineering (Honours)", "4 years", "RM16,168", "RM15,000 / 2nd & 3rd & 4th year", "RM61,168"),
                    @("13", "Master of Business Administration (MBA) (By coursework)", "1.5 years", "RM16,168", "RM9,000", "RM25,168"),
                    @("14", "Master of Education", "1.5 years", "RM16,168", "RM9,000", "RM25,168"),
                    @("15", "Master in Computing (By research)", "2 years", "RM16,168", "RM9,000", "RM25,168"),
                    @("16", "Master of Science in Engineering (By research)", "2 years", "RM16,168", "RM9,000", "RM25,168"),
                    @("17", "Doctor of Philosophy in Education", "3 years", "RM16,168", "RM9,000 / 2nd & 3rd year", "RM34,168"),
                    @("18", "Doctor of Philosophy (Computing)", "3 years", "RM16,168", "RM9,000 / 2nd & 3rd year", "RM34,168"),
                    @("19", "Doctor of Philosophy in Engineering", "3 years", "RM16,168", "RM9,000 / 2nd & 3rd year", "RM34,168"),
                    @("20", "Doctor of Philosophy in Business Management", "3 years", "RM16,168", "RM9,000 / 2nd & 3rd year", "RM34,168")
                )
            }
        },
        @{
            category_name = "BAC COLLEGE"
            pdf_link = "bac-fees"
            remarks = "<strong>Misc Fees:</strong><br>EMGS & Application Fee: RM4,800<br>Resource Fee: RM1,000 / per year<br>Visa Renewal Fee: RM1,200 / per year<br>Personal Bond: RM750<br><strong>Total Misc Fees: RM7,750 + yearly Resource & Visa fees</strong>"
            table = @{
                headers = @("No", "Programme", "Duration", "Tuition Fees (1st Year)", "Tuition Fees (Following Years)", "Total Tuition Fee")
                rows = @(
                    @("1", "Foundation in Business", "1 year", "RM23,068", "-", "RM23,068"),
                    @("2", "Foundation in Law", "1 year", "RM26,068", "-", "RM26,068"),
                    @("3", "A-Level (2 subjects)", "1.5 years", "RM23,900", "-", "RM23,900"),
                    @("4", "A-Level (3 subjects)", "1.5 years", "RM31,900", "-", "RM31,900"),
                    @("5", "A-Level (4 subjects)", "1.5 years", "RM36,900", "-", "RM36,900"),
                    @("6", "LLB (3+0) University of London International Programmes", "3 years", "RM21,168 + UK Partner Fees", "RM20,000 + UK Partner Fees", "RM61,168 + UK Partner Fees"),
                    @("7", "UK Transfer Degree Programme Law", "3 years", "RM36,168 + UK Partner Fees", "RM35,000 + UK Partner Fees", "RM71,168 + UK Partner Fees"),
                    @("8", "UK Transfer Degree Programme Business", "3 years", "RM27,168 + UK Partner Fees", "RM26,000 + UK Partner Fees", "RM53,168 + UK Partner Fees")
                )
            }
        },
        @{
            category_name = "IACT COLLEGE"
            pdf_link = "bac-fees"
            remarks = "<strong>Misc Fees:</strong><br>EMGS & Application Fee: RM4,800<br>Resource Fee: RM1,000 / per year<br>Visa Renewal Fee: RM1,200 / per year<br>Personal Bond: RM750<br><strong>Total Misc Fees: RM7,750 + yearly Resource & Visa fees</strong>"
            table = @{
                headers = @("No", "Programme", "Duration", "Tuition Fees (1st Year)", "Tuition Fees (Following Years)", "Total Tuition Fee")
                rows = @(
                    @("1", "Foundation in Media Studies", "1 year", "RM18,068", "-", "RM18,068"),
                    @("2", "Diploma in Broadcasting and Film", "2 years", "RM22,668", "RM21,500", "RM44,168"),
                    @("3", "Diploma in Mass Communication", "2 years", "RM22,668", "RM21,500", "RM44,168"),
                    @("4", "BA Hons (Film Production) - University of Sunderland (3+0)", "3 years", "RM29,768", "RM28,600 / 2nd year, RM29,800 / 3rd year", "RM88,168"),
                    @("5", "BA Hons in Advertising & Design - University of Sunderland (3+0)", "3 years", "RM29,768", "RM28,600 / 2nd year, RM29,800 / 3rd year", "RM88,168"),
                    @("6", "BA Hons in Media Culture and Communication - University of Sunderland (3+0)", "3 years", "RM29,768", "RM28,600 / 2nd year, RM29,800 / 3rd year", "RM88,168"),
                    @("7", "BA Hons in Social Media Management - University of Sunderland (3+0)", "3 years", "RM29,768", "RM28,600 / 2nd year, RM29,800 / 3rd year", "RM88,168"),
                    @("8", "UK Degree Transfer Programme (Mass Communication) (2+1)", "3 years", "RM28,168 + UK Partner Fees", "RM27,000 + UK Partner Fees", "RM55,168 + UK Partner Fees")
                )
            }
        },
        @{
            category_name = "VERITAS UNIVERSITY"
            pdf_link = "bac-fees"
            remarks = "<strong>Other Fees:</strong><br>EMGS & Application Fee: RM4,800 (Non-refundable)<br>Resource Fee: RM1,000 / year (Non-refundable)<br>Visa Renewal Fee: RM1,200 / year (Non-refundable)<br><br><strong>Intakes Calendar:</strong><br>Undergraduate Programs Conventional: Jan, May, Sep<br>ODL: Jan, May, June, Sep<br>Bachelor of Communication (Branding & Digital Marketing): Conventional Jan, Jun, Aug; ODL Jan, Jun, Aug<br>Postgraduate Programs: Conventional Jan, May, Sep (MBA); ODL Jan, May, Sep (DBA, PhD); ODL Monthly (MBA, MBACL, MCLG, MA Law)"
            table = @{
                headers = @("No", "Programme", "Duration", "Tuition Fees (1st Year)", "Tuition Fees (Following Years)", "Total Tuition Fee")
                rows = @(
                    @("1", "Foundation in Arts", "1 year", "RM17,168", "-", "RM17,168"),
                    @("2", "Diploma in Early Childhood Education", "2.5 years", "RM16,168", "RM13,000", "RM29,168"),
                    @("3", "BA (Hons) Accounting & Finance", "3 years", "RM16,168", "RM15,000 / 2nd & 3rd year", "RM46,168"),
                    @("4", "Bachelor of Communication (Hons) Branding & Digital Marketing", "3 years", "RM16,168", "RM15,000 / 2nd & 3rd year", "RM46,168"),
                    @("5", "Bachelor of Education (Early Childhood) with Honors", "3 years", "RM16,168", "RM15,000 / 2nd & 3rd year", "RM46,168"),
                    @("6", "Bachelor in Business Administration (Hons)", "3 years", "RM16,168", "RM15,000 / 2nd & 3rd year", "RM46,168"),
                    @("7", "Masters of Business Administration", "1.5 years", "RM16,168", "RM9,000", "RM25,168")
                )
            }
        },
        @{
            category_name = "RELIANCE COLLEGE"
            pdf_link = "bac-fees"
            remarks = "<strong>Other Fees:</strong><br>EMGS & Application Fee: RM4,800 (Non-refundable)<br>Visa Renewal Fee: RM1,200 / year (Non-refundable)<br>Resource Fee: RM1,000 / year (Non-refundable)<br><br><strong>Intakes Calendar:</strong><br>Pre-University Programs: Feb, Apr, Aug"
            table = @{
                headers = @("No", "Programme", "Duration", "Tuition Fees (1st Year)", "Tuition Fees (Following Years)", "Total Tuition Fee")
                rows = @(
                    @("1", "Diploma in Culinary Arts", "2 years", "RM16,168", "RM13,000", "RM29,168"),
                    @("2", "Diploma in Business Management", "2.5 years", "RM16,168", "RM13,000", "RM29,168"),
                    @("3", "Diploma in Hotel Management", "2.5 years", "RM16,168", "RM13,000", "RM29,168")
                )
            }
        }
    )
}

$data.bac = $bac
$data | ConvertTo-Json -Depth 10 | Set-Content $jsonFile
