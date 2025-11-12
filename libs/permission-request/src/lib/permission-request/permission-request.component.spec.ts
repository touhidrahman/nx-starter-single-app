import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PermissionRequestComponent } from './permission-request.component'

describe('PermissionRequestComponent', () => {
    let component: PermissionRequestComponent
    let fixture: ComponentFixture<PermissionRequestComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PermissionRequestComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(PermissionRequestComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
