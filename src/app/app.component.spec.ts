import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Board } from './game/board';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AppComponent] });
  });

  function create() {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders a 20x20 board', () => {
    const el: HTMLElement = create().nativeElement;
    expect(el.querySelectorAll('tr').length).toBe(20);
    expect(el.querySelectorAll('td').length).toBe(400);
  });

  it('toggles a flag on right-click', () => {
    const fixture = create();
    const td: HTMLElement = fixture.nativeElement.querySelector('td');
    const cell = fixture.componentInstance.board().cells[0][0];

    td.dispatchEvent(new MouseEvent('contextmenu', { cancelable: true }));
    fixture.detectChanges();
    expect(cell.status()).toBe('flag');
    expect(td.querySelector('svg')).not.toBeNull();

    td.dispatchEvent(new MouseEvent('contextmenu', { cancelable: true }));
    fixture.detectChanges();
    expect(cell.status()).toBe('open');
    expect(td.querySelector('svg')).toBeNull();
  });

  it('alerts "You lose" when a mine is clicked', () => {
    const fixture = create();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const mine = fixture.componentInstance.board().cells.flat().find((c) => c.mine)!;

    fixture.componentInstance.checkCell(mine);
    expect(alert).toHaveBeenCalledWith('You lose');
    alert.mockRestore();
  });

  it('shows the proximity count for a cleared safe cell', () => {
    const fixture = create();
    const board = fixture.componentInstance.board();
    const safe = board.cells.flat().find((c) => !c.mine && c.proximityMines > 0)!;

    fixture.componentInstance.checkCell(safe);
    fixture.detectChanges();
    const td: HTMLElement = fixture.nativeElement.querySelectorAll('tr')[safe.row].querySelectorAll('td')[safe.column];
    expect(td.textContent?.trim()).toBe(String(safe.proximityMines));
  });

  it('replaces the board on restart', () => {
    const fixture = create();
    const before = fixture.componentInstance.board();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    expect(fixture.componentInstance.board()).not.toBe(before);
    expect(fixture.componentInstance.board()).toBeInstanceOf(Board);
  });
});
