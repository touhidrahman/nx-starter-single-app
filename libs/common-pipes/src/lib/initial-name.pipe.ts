import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'initialName',
    standalone: true,
})
export class InitialNamePipe implements PipeTransform {
    transform(firstName: string): string {
        return firstName?.charAt(0)?.toUpperCase()
    }
}
