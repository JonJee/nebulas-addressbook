import Nebulas from 'nebulas';
import { dappAddress, networkAddress } from '../../config';
import NebPay from 'nebpay.js';

class ContractDataController {
    constructor() {
        this.nebPay = new NebPay();
        this.neb = new Nebulas.Neb();
        this.callbackUrl = networkAddress === "https://mainnet.nebulas.io" ? NebPay.config.mainnetUrl : NebPay.config.testnetUrl;
        this.serialNumber = undefined;
        this.intervalId = undefined;
        this.intervalCount = 0;
        this.userAddress = '';
    }

    getAccount(callback = undefined) {
        NasExtWallet.getUserAddress(addr => {
            this.userAddress = addr;
            console.log("user address is : " + this.userAddress);
            callback && callback();
        });
    }

    // 컨트랙트 호출
    callSmartContract(func, args, callback) {
        this.neb.setRequest(new Nebulas.HttpRequest(networkAddress));
        this.neb.api.call({
            chainID: 1,
            from: this.userAddress,
            to: dappAddress,
            value: 0,
            gasPrice: 1000000,
            gasLimit: 2000000,
            contract: {
                function: func,
                args: args
            }
        }).then(tx => {
            // console.log(tx.result);
            callback(tx);
        });
    }

    // 트랜잭션 전송
    sendTransaction(value, func, args, pendingCallbackListener = undefined, successCallbackListener = undefined, failCallbackListener = undefined) {
        this.serialNumber = this.nebPay.call(dappAddress, value, func, args, {
            callback: this.callbackUrl,
            listener: () => {
                pendingCallbackListener && pendingCallbackListener();
                this._checkPayInfo(successCallbackListener, failCallbackListener);
            },
            qrcode: {
                showQRCode: false,
                container: undefined,
                completeTip: undefined,
                cancelTip: undefined,
            },
        });
    }

    // 4초마다 트랜잭션의 상태를 체크
    _checkPayInfo = (successCallbackListener, failCallbackListener) => {
        this.intervalId = setInterval(() => {
            this._queryPayInfo(successCallbackListener, failCallbackListener);
            this.intervalCount++;
            console.log(this.intervalId);
            console.log(this.intervalCount);
            if (this.intervalCount > 6) {
                clearInterval(this.intervalId);
                this.intervalCount = 0;
            }
        }, 4000);
    }

    // 트랜잭션 정보 받아옴
    _queryPayInfo = (successCallbackListener, failCallbackListener) => {
        this.nebPay.queryPayInfo(this.serialNumber, { callback: this.callbackUrl })
            .then(res => {
                var status = JSON.parse(res).data.status;
                console.log(res);
                // tx: pending
                if (status === 1 || status === 0) {
                    if (this.intervalId) clearInterval(this.intervalId);
                    this.intervalCount = 0;
                }
                // tx: succes
                if (status === 1) {
                    successCallbackListener && successCallbackListener();
                }
                // tx: fail
                else if (status === 0) {
                    failCallbackListener && failCallbackListener();
                }
            })
            .catch(err => {
                console.log('ERROR1: ' + err);
            });
    }

    transfer(to, amount) {
        this.nebPay.pay(to, amount, {
            qrcode: {
                showQRCode: false,
            },
            listener: this.cbSendTx,
        });
    }

    cbSendTx(resp){
        console.log("AAA callback resp: " + JSON.stringify(resp));
    }
}

export default new ContractDataController();
