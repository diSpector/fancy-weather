export default class ApiHelper {
    constructor(configObj, newParams = null) {
      this.configObj = configObj;
      this.newParams = newParams;
    //   this.params = {};
    }

    getRequestUrl() { // вернуть запрос для доступа к API
        const params = this.getParams();
        const query = this.getUrlStrFromObj(params);
        const requestUrl = `${this.configObj.url}${query}`;
        return requestUrl;
    }

    getParams() { // установить пар-ры - добавить/заменить или оставить без изменения
        // this.params = (this.newParams) ? 
        //     {...this.configObj.params, ...this.newParams}
        //     : this.this.configObj.params;
        return (this.newParams) ? 
            {...this.configObj.params, ...this.newParams}
            : this.configObj.params;
    }

    getUrlStrFromObj(paramsObj) { // получить из объекта строку для запроса
        const urlParams = new URLSearchParams(paramsObj);
        return urlParams.toString();
    }

}