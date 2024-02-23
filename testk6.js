import http from 'k6/http'
import { check, sleep } from 'k6';

export const options = {
    // vus: 1,
    // duration: '30s',
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 1,
            timeUnit: '60s',
            duration: '60m',
            preAllocatedVUs: 5,
            maxVUs: 10,
        },
    },
    ext: {
        loadimpact: {
            // Project: Default project
            projectID: 3683635,
            // Test runs with the same name groups test runs together.
            name: 'cada minuto una hora'
        }
    }
};

export default function () {
    //const data = { username: 'username', password: 'password' }
    let res = http.get('http://localhost:3000/');
    console.log(res.status);
    //console.log(res);
    check(res, { 'success 200': (r) => r.status === 200 });
}
