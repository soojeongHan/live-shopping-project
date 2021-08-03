import { CreateLiveEventDto } from "../dto/create-live-event.dto";

let count = 0
const baseUrl = 'http://localhost:5000'

// TODO Error Handling 
class HttpClient {
    constructor(){
        count++;
        if(count > 1){
            throw new Error('httpService has been already instantiated')
        }
    }
    /* getLiveEventList 함수는 이벤트 리스트를 가져와, 
       데이터를 반환합니다. 
    */
    async getLiveEventList() {
        const data = await fetch(baseUrl + '/live-event')
        return data.json()
    }

    /* getLiveEventById 함수는 string type의 id를 argument로 받아서, 
       이벤트 id로 검색된 이벤트를 가져와,
       데이터를 반환합니다.
    */
    async getLiveEventById(id: string) {
        const data = await fetch(baseUrl + `/live-event/${id}/product`)
        return data.json()
    }
    /* addLiveEvent 함수는 CreateLiveEventDto type의 데이터를 argument로 받아서,
       데이터를 전송하여 새로운 이벤트를 등록합니다.
       서버로부터 201 status code가 반환되면 true를, 아니면 false를 반환합니다.
    */
    async addLiveEvent(data: CreateLiveEventDto) {
        const { status } = await fetch(baseUrl + '/live-event', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json'
            }
        })
        return status === 201;
    }
    /* updateLiveEvent 함수는 CreateLiveEventDto type의 데이터와 string type의 id를 argument로 받아서,
       데이터를 전송하여 이벤트를 수정합니다.
    */
    async updateLiveEvent(id: string, data: CreateLiveEventDto) {
        const success = await fetch(baseUrl + `/live-event/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json'
            }
        })
        return success
    }
    /* addLiveEvent 함수는 string type의 id를 argument로 받아서,
       삭제 요청을 통해 이벤트를 삭제합니다.
    */
    async deleteLiveEvent(id: string) {
        const success = await fetch(baseUrl + `/live-event/${id}`, {
            method: 'DELETE'
        })
        return success
    }
    /* getProduct 함수는 product 리스트를 가져와, 
       데이터를 반환합니다. 
    */
    async getProduct() {
        const data = await fetch(baseUrl + `/product`)
        return data.json()
    }
    /* getProductById 함수는 string type의 id를 argument로 받아서,
       product 리스트를 가져와, 데이터를 반환합니다. 
    */
    async getProductById(id: string) {
        const data = await fetch(baseUrl + `/product/${id}`)
        return data.json()
    }
}
/* 
   해당 클래스의 인스턴스는 단 하나만 존재 할 수 있도록 하기 때문에, 
   클래스의 인스턴스를 생성 후 export 처리합니다.
*/
const httpClient = new HttpClient()
export default httpClient
