import { CommonModule, NgOptimizedImage } from '@angular/common'
import { Component } from '@angular/core'
@Component({
    selector: 'app-faq',
    imports: [CommonModule],
    templateUrl: './faq.component.html',
    styleUrl: './faq.component.scss',
})
export class FaqComponent {
    faqs = [
        {
            question: 'Is MyApp free to use?',
            answer: 'Yes, MyApp offers a generous free tier to manage your cases and a small team. To add more cases and team members , upgrade to a suitable plan. For clients MyApp will always be free.​',
        },
        {
            question: 'How does “real-time case tracking” works?​',
            answer: 'MyApp automatically sends SMS/Email before a case date. Additionally you can send custom email or SMS to your client right from MyApp.​',
        },
        {
            question: 'Can I upload my legal documents on MyApp?​',
            answer: 'Absolutely. MyApp allows you to securely upload, store, and share your case related documents for your easy reference.​',
        },
        {
            question: 'How do I connect with a verified legal expert?',
            answer: 'You may find experienced and verified lawyers in our lawyer directory page.​',
        },
        {
            question: 'Is my personal information safe on MyApp?​',
            answer: 'Yes. MyApp uses encryption and privacy-first design to ensure your data is always secure and confidential.​',
        },
        {
            question:
                'What kind of legal issues can I get help with on MyApp?​',
            answer: 'MyApp supports a wide range of legal areas — from property disputes, family issues, business matters, to criminal and labor law.​',
        },
        {
            question: 'Can I manage multiple cases on MyApp?​',
            answer: 'Yes, you can track and manage multiple cases at once with separate timelines, documents, and communication threads.​',
        },
        {
            question: 'What devices can I use MyApp on?​',
            answer: 'MyApp is available on Android and web. An iOS app is coming soon. In the meantime you can use the mobile version of MyApp web using your smartphone browser. All the features are accessible from app and web anytime anywhere.​',
        },
    ]

    openIndex: number | null = null

    toggle(index: number) {
        this.openIndex = this.openIndex === index ? null : index
    }
}
