import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'getCasePartySide',
    standalone: true,
})
export class GetCasePartySidePipe implements PipeTransform {
    transform(side: 'left' | 'right', caseType: 'civil' | 'criminal'): string {
        if (caseType === 'civil') {
            return side === 'left' ? 'Plaintiff' : 'Defendant'
        }
        return side === 'left' ? 'Complainant' : 'Accused'
    }
}
