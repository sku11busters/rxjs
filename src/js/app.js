import { interval } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

const apiUrl = 'https://rxjs-back-44rw.onrender.com/messages/unread';
const pollingInterval = 5000;

interval(pollingInterval)
  .pipe(
    switchMap(() =>
      ajax.getJSON(apiUrl).pipe(
        switchMap((response) => {
          if (response.status !== 'ok') {
            throw new Error('Ошибка сервера');
          }
          return of(response.messages[0]);
        }),
      ),
    ),
    catchError((error) => {
      console.error('Error:', error);
      return of([]);
    }),
  )
  .subscribe((newMessage) => {
    if (newMessage) {
      const tableBody = document.getElementById('message-table-body');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${newMessage.from}</td>
        <td>${truncateSubject(newMessage.subject)}</td>
        <td>${formatDate(newMessage.received)}</td>
      `;
      tableBody.prepend(row);
    }
  });

function truncateSubject(subject) {
  return subject && subject.length > 15 ? `${subject.substring(0, 15)}...` : subject;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}.${month}.${year}`;
}
