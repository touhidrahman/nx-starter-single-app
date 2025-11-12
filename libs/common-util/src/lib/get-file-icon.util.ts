export function getFileExtensionName(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
}

export function getFileIcon(filename: string): string {
    const extension = getFileExtensionName(filename)
    const iconMap: { [key: string]: string } = {
        pdf: '/assets/icons/pdf-icon.png',
        doc: '/assets/icons/doc-icon.png',
        docx: '/assets/icons/doc-icon.png',
        xls: '/assets/icons/xls-icon.png',
        xlsx: '/assets/icons/xls-icon.png',
        ppt: '/assets/icons/ppt-icon.png',
        pptx: '/assets/icons/ppt-icon.png',
        txt: '/assets/icons/txt-icon.png',
        default: '/assets/icons/generic-file-icon.png',
    }
    return iconMap[extension] || iconMap['default']
}
