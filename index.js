"use strict";

const MyForm = {

    /**
     * Выполняет валидацию полей и отправку ajax-запроса,
     * если валидация пройдена. Вызывается по клику на кнопку отправить.
     * @param  {Event} e
     */
    submit: function(e){
      e.preventDefault();

      const validation = this.validate();
      const form = document.getElementById('myForm');
      const fields = form.getElementsByTagName('input');

      //Удаляем красные рамки ошибок у всех инпутов
      for (let field of fields) {
        field.classList.remove('error');
      }

      if(!validation.isValid){
        //Добавляем красные рамки полям с ошибками
        for (let field of validation.errorFields) {
          document.getElementsByName(field)[0].classList.add('error');
        }
      } else {
        const button = e.target;
        button.disabled = true;

        //Отправляем запрос на сервер
        this.sendRequest();

      }
    },

    /**
     * Отправляет форму на сервер через XMLHttpRequest
     */
    sendRequest: function(){
      //Отправляем запрос на "сервер" (JSON-файл)
      const form = document.getElementById('myForm');
      const resultContainer = document.getElementById('resultContainer');
      const xhr = new XMLHttpRequest();
      xhr.open('GET', form.action, true);
      xhr.onreadystatechange = () => {

        if(xhr.readyState == 4){
          if(xhr.status == 200){
            let response = JSON.parse(xhr.responseText);
            switch(response.status){
              case 'success':
                resultContainer.innerHTML = 'Success';
                resultContainer.className = 'success';
                break;
              case 'error':
                resultContainer.innerHTML = response.reason;
                resultContainer.className = 'error';
                break;
              case 'progress':
                resultContainer.innerHTML = "Progress...";
                resultContainer.className = 'progress';
                setTimeout(this.sendRequest.bind(this), response.timeout);
                break;
            }
          }

        }
      }
      xhr.send(null);
    },

    /**
     * Возвращает объект с признаком результата валидации (isValid)
     * и массивом названий полей, которые не прошли валидацию (errorFields)
     * @return {Object}
     */
    validate: function(){
      const data = this.getData();
      const errorFields = [];
      let re;

      //Валидация fio
      //Количество слов = 3
      re = /^[А-ЯA-Z-]+\s[А-ЯA-Z-]+\s[А-ЯA-Z-]+$/igm;
      let isFioValid = re.test(data.fio);
      if(!isFioValid) errorFields.push('fio');

      //Валидация email
      //Regexp + валидация разрешённых доменов
      re = /^[A-Z0-9._%+-]+@[A-Z]+.[A-Z]{2,3}$/igm;
      const acceptDomains = ['ya.ru', 'yandex.ru', 'yandex.ua', 'yandex.by', 'yandex.kz', 'yandex.com'];
      let isEmailValid = re.test(data.email) && ( acceptDomains.indexOf( data.email.split('@')[1] ) !== -1 );
      if(!isEmailValid) errorFields.push('email');

      //Валидация phone
      //Regexp + сумма всех цифр должна быть не больше 30
      let isPhoneValid = false;
      re = /^\+7\([0-9]{3}\)[0-9]{3}\-[0-9]{2}\-[0-9]{2}$/igm;
      if(re.test(data.phone)){
        let phoneSum = data.phone.match(/[0-9]/g).reduce(function(sum, current){
          return parseInt(sum) + parseInt(current);
        });
        isPhoneValid = phoneSum <= 30;
      }
      if(!isPhoneValid) errorFields.push('phone');

      return {
        isValid: isFioValid && isEmailValid && isPhoneValid,
        errorFields
      }
    },

    /**
     * Принимает объект с данными формы и устанавливает их инпутам формы. Поля кроме phone, fio, email игнорируются.
     * @param  {Object} data
     */
    setData: function(data){
      const form = document.getElementById('myForm');
      const fields = form.getElementsByTagName('input');

      const acceptFields = ['fio', 'email', 'phone'];
      for (var fieldName in data) {
        if (data.hasOwnProperty(fieldName) && acceptFields.indexOf(fieldName) !== -1) {
          fields[fieldName].value = data[fieldName];
        }
      }
    },

    /**
     * Возвращает объект с данными формы, где имена свойств совпадают с именами инпутов.
     * @return {Object}
     */
    getData: function(){
      const form = document.getElementById('myForm');
      const fields = form.getElementsByTagName('input');
      const data = {};

      for (let field of fields) {
        data[field.name] = field.value.trim();
      }

      return data;
    }
}
