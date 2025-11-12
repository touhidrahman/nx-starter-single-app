import { Pipe, PipeTransform } from '@angular/core'

export type CaseType = 'criminal' | 'civil' | undefined
export type PartySide = 'left' | 'right'

@Pipe({
    name: 'casePartyTitle',
    standalone: true,
})
export class CasePartyTitlePipe implements PipeTransform {
    transform(side: PartySide, caseType: CaseType): string {
        switch (caseType) {
            case 'criminal':
                return side === 'left' ? 'Complainant' : 'Accused'
            case 'civil':
                return side === 'left' ? 'Plaintiff' : 'Defendant'
            default:
                return side === 'left'
                    ? 'Complainant / Plaintiff'
                    : 'Accused / Defendant'
        }
    }
}
