import React from 'react'

export default function App_Home() {
    return(
        <div className="HomePage">
            <div className="content">
                <h1 className="title">SecureCheck</h1>
                <p className="subtitle">Analyze passwords & detect suspicious links</p>
            </div>
            <div className="nav-buttons">
                <a href="./password.html" className='btn'><i class="fa-solid fa-key"></i> Password Strength Checker</a>
                <a href="./url.html" className='btn'><i class="fa-solid fa-link"></i> Malicious URL Detector</a>
            </div>

            <footer>
            <p>
                &copy; {new Date().getFullYear()} SecureCheck - By <strong>Ayman Kz</strong>    
            </p>
            </footer>
        </div>
    )
}