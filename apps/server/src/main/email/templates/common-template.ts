import env from "../../../env"

export class EmailTemplateBuilder<TProps> {
    private header = `
    <tr>
        <td style="background-color: #22c55e; padding: 6px 0; text-align: center;">
        <img src="${env.FRONTEND_URL}/assets/images/logo1.png" alt="Logo" style="max-width: 400px; border-radius: 20px; height: auto;">
        </td>
    </tr>
    `

    private body = ''

    private footer = `
    <tr>
        <td style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
        &copy; 2025 <span style="font-weight: 600;">MyApp</span>. All rights reserved.
        </td>
    </tr>
    `

    setHeader(header: string) {
        this.header = header
        return this
    }

    setFooter(footer: string) {
        this.footer = footer
        return this
    }

    setBodyTemplate(content: string) {
        this.body = content
        return this
    }

    build(props: TProps) {
        const tpl = `
        <body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f8fa; padding: 40px 0;">
            <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                ${this.header}
                ${this.replacePlaceholders(this.body, props)}
                ${this.footer}
                </table>
            </td>
            </tr>
        </table>
        </body>
        `

        return tpl
            .trim()
            .replace(/(\r?\n|\r)/g, ' ') // remove line breaks
            .replace(/\s+/g, ' ') // replace multiple spaces with a single space
            .replace(/>\s+</g, '><') // remove spaces between HTML tags
    }

    private replacePlaceholders(body: string, props: TProps): string {
        let html = body
        for (const [key, value] of Object.entries(
            props as Record<string, any>,
        )) {
            if (value) {
                html = html.replaceAll(`{{${key}}}`, value)
            }
        }
        return html
    }
}
