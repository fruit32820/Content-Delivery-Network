#ifndef MYQUEUE_HPP
#define MYQUEUE_HPP

#include<stdexcept>

template<typename _Tp=int>
class myqueue{
private:
    _Tp *q;
    unsigned long long f=0, r=0, ms;

public:
    myqueue(long long size) : ms(size+1) {
        if(!size) throw std::invalid_argument("Max size can not be 0.");
        q = new _Tp[ms];
    }
    
    ~myqueue() { delete[] q; }

    bool empty() const { return f == r; }
    bool full() const { return (r+1)%ms == f; }

    int push(const _Tp& x) {
        if(full()) throw std::overflow_error("Queue is full.");
        q[r] = x;
        r = (r+1)%ms;
        return 0;
    }

    int pop() {
        if(empty()) throw std::underflow_error("Queue is empty.");
        f = (f+1)%ms;
        return 0;
    }

    _Tp front() const {
        if(empty()) throw std::underflow_error("Queue is empty.");
        return q[f];
    }

    long long size() const {
        return (r - f + ms) % ms;
    }

    void clear() { f = r = 0; }

#if __cplusplus >= 20110311L

    myqueue(const myqueue&) = delete;
    myqueue& operator=(const myqueue&) = delete;

#else

    myqueue(const myqueue& other){
        if(ms < other.ms){
            delete[] q;
            ms = other.ms;
            q = new _Tp[ms];
        }
        std::copy(other.q, other.q + ms, q);
    }

    myqueue& operator=(const myqueue& other) {
        if(this != &other) {
            delete[] q;
            ms = other.ms;
            f = other.f;
            r = other.r;
            q = new _Tp[ms];
            std::copy(other.q, other.q + ms, q);
        }
        return *this;
    }

#endif // _cplusplus >= 20110311L

};

#endif // MYQUEUE_H
