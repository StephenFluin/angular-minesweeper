import { Component, signal } from '@angular/core';
import { Board } from './game/board';
import { Cell } from './game/cell';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  board = signal(new Board(20, 50));

  checkCell(cell: Cell) {
    const result = this.board().checkCell(cell);
    if (result === 'gameover') {
      alert('You lose');
    } else if (result === 'win') {
      alert('you win');
    }
  }
  flag(cell: Cell) {
    cell.status.update((status) => (status === 'flag' ? 'open' : 'flag'));
  }

  reset() {
    this.board.set(new Board(20, 50));
  }
}
