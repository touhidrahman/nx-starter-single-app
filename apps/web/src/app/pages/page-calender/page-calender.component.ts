import { DatePipe } from '@angular/common'
import { Component, inject, signal, viewChild } from '@angular/core'
import { RouterModule } from '@angular/router'
import {
    FullCalendarComponent,
    FullCalendarModule,
} from '@fullcalendar/angular'
import {
    CalendarOptions,
    DatesSetArg,
    EventClickArg,
    EventInput,
} from '@fullcalendar/core'
import { EventImpl } from '@fullcalendar/core/internal'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import { WA_WINDOW } from '@ng-web-apis/common'
import {
    CalendarApiService,
    CalendarEventDialogComponent,
} from '@repo/calendar'
import { PrimeModules } from '@repo/prime-modules'
import { endOfMonth, startOfMonth } from 'date-fns'
import { DialogService } from 'primeng/dynamicdialog'
import { catchError, of } from 'rxjs'
import { COLOR_PALETTE_TAILWIND } from './color-palette'

@Component({
    selector: 'app-page-calender',
    standalone: true,
    imports: [FullCalendarModule, PrimeModules, RouterModule],
    templateUrl: './page-calender.component.html',
    styleUrl: './page-calender.component.scss',
    providers: [DatePipe, DialogService],
})
export class PageCalenderComponent {
    private calendarApiService = inject(CalendarApiService)
    private windowRef = inject(WA_WINDOW)
    private readonly calendarComponent =
        viewChild.required<FullCalendarComponent>('calendar')
    private dialogService = inject(DialogService)
    private caseColorMap = new Map<string, number>()
    private nextColorIndex = 0

    caseColors = signal<Record<string, string>>({})
    events = signal<EventInput[]>([])
    visible = signal(false)
    eventDetails = signal<EventImpl | null>(null)
    isLoading = signal(false)
    props = signal<Record<string, any> | null>(null)

    calendarOptions: CalendarOptions = {
        initialView:
            this.windowRef.innerWidth < 640 ? 'listMonth' : 'dayGridMonth',
        events: this.events(),
        eventClick: this.handleEventClick.bind(this),
        datesSet: this.handleDatesChange.bind(this),
        plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
        },
        aspectRatio: 2,
        views: {
            dayGridMonth: { dayMaxEventRows: 3 },
        },
        eventDidMount: this.handleEventDidMount.bind(this),

        windowResize: () => {
            const calendarApi = this.calendarComponent().getApi()
            if (this.windowRef.innerWidth < 640) {
                calendarApi.changeView('listMonth')
            } else {
                calendarApi.changeView('dayGridMonth')
            }
        },
    }

    private handleEventDidMount(info: any) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const eventEnd = info.event.end ?? info.event.start

        if (eventEnd && eventEnd < today) {
            info.el.style.backgroundColor = '#F0F4F0'
            info.el.style.border = '1px solid #ffffff'
            const titleEl = info.el.querySelector('.fc-event-title')
            if (titleEl) {
                ;(titleEl as HTMLElement).style.color = '#2F4F4F'
            }
        }
    }

    private getStableColorForCaseId(caseId: string): string {
        if (this.caseColorMap.has(caseId)) {
            const colorId = this.caseColorMap.get(caseId)!
            return COLOR_PALETTE_TAILWIND[colorId].shades[800]
        }
        const colorId = this.nextColorIndex % COLOR_PALETTE_TAILWIND.length
        this.caseColorMap.set(caseId, colorId)

        this.caseColors.update((colors) => ({
            ...colors,
            [caseId]: COLOR_PALETTE_TAILWIND[colorId].shades[800],
        }))

        this.nextColorIndex++
        return COLOR_PALETTE_TAILWIND[colorId].shades[800]
    }

    private getCaseHistory(startDate: Date, endDate: Date) {
        this.isLoading.set(true)
        this.calendarApiService
            .getAll({
                search: '',
                startDate: startDate,
                endDate: endDate,
            })
            .pipe(
                catchError((err) => {
                    console.error('Error loading events:', err)
                    this.isLoading.set(false)
                    return of({ data: [] })
                }),
            )
            .subscribe({
                next: (res) => {
                    if (res.data) {
                        const newEvents = res.data.map((event) => ({
                            ...event,
                            title: `${event.title} - ${event.caseNumber} - ${event.caseTitle}`,
                            color: this.getStableColorForCaseId(event.caseId),
                            extendedProps: {
                                eventTitle: event.title,
                                content: event.content,
                                caseId: event.caseId,
                                caseTitle: event.caseTitle,
                                caseNumber: event.caseNumber,
                                caseDate: event.caseDate,
                            },
                        }))

                        this.events.set(newEvents)
                        this.calendarComponent().getApi().refetchEvents()
                    }
                    this.isLoading.set(false)
                },
            })
    }

    private handleDatesChange(info: DatesSetArg) {
        const currentMonthStart = startOfMonth(info.view.currentStart)
        const currentMonthEnd = endOfMonth(info.view.currentStart)

        const adjustedStartMonthDate = new Date(currentMonthStart)
        adjustedStartMonthDate.setDate(adjustedStartMonthDate.getDate() - 1)
        this.getCaseHistory(adjustedStartMonthDate, currentMonthEnd)
    }

    private handleEventClick(arg: EventClickArg) {
        this.dialogService.open(CalendarEventDialogComponent, {
            width: '60vw',
            breakpoints: {
                '640px': '93vw',
            },
            data: arg.event.extendedProps,
            header: `${arg.event.extendedProps['caseNumber']} - ${arg.event.extendedProps['eventTitle']}`,
            modal: true,
            closable: true,
            draggable: false,
        })
    }
}
