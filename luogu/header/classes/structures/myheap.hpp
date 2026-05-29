#ifndef MYHEAP_HPP
#define MYHEAP_HPP

#include<stdexcept>

template<typename T=int, typename Compare=std::greater<T> >
class myheap{
private:
    unsigned long long ms;
    T *p;
    unsigned long long len;
    Compare comp;

    void fix(int pos) {
        while(pos > 1 && comp(p[pos], p[pos>>1])){
            swap(p[pos], p[pos>>1]);
            pos >>= 1;
        }
    }

    void repair(int pos) {
        int l = pos << 1, r = l + 1, t = pos;
        while(l <= len) {
            if(comp(p[l], p[t])) t = l;
            if(r <= len && comp(p[r], p[t])) t = r;
            if(t != pos) {
                swap(p[pos], p[t]);
                pos = t;
                l = pos << 1;
                r = l + 1;
            } else break;
        }
    }

    bool valid(unsigned long long pos) const {
        return pos >= 1 && pos <= len;
    }

public:
    myheap(unsigned long long size_max) : ms(size_max), len(0) {
        if(!size_max) throw std::invalid_argument("Max size can not be 0.");
        p = new T[ms + 1];
    }

    ~myheap() { delete[] p; }

    
    bool full() const { return len >= ms; }
    bool empty() const { return !len; }
    unsigned long long size() const { return len; }
    void clear() { len = 0; }

#if __cplusplus >= 201103L

    myheap(const myheap&) = delete;
    myheap& operator=(const myheap&) = delete;

#else

    myheap(const myheap& other) : ms(other.ms), len(other.len), comp(other.comp) {
        p = new T[ms + 1];
        std::copy(other.p, other.p + len + 1, p);
    }

    myheap& operator=(const myheap& other) {
        if(this != &other) {
            if(ms < other.ms) {
                delete[] p;
                ms = other.ms;
                p = new T[ms + 1];
            }
            len = other.len;
            comp = other.comp;
            std::copy(other.p, other.p + len + 1, p);
        }
        return *this;
    }

#endif // __cplusplus >= 201103L

    T get(unsigned long long pos) const {
        if(!valid(pos)) throw std::out_of_range("Position is out of range.");
        return p[pos];
    }

    T at(unsigned long long pos) const {
        return get(pos);
    }

    T operator[](unsigned long long pos) const {
        return get(pos);
    }

    void modify(unsigned long long pos, const T& x) {
        if(!valid(pos)) throw std::out_of_range("Position is out of range.");
        p[pos] = x;
        fix(pos);
        repair(pos);
    }

    void erase(unsigned long long pos) {
        if(!valid(pos)) throw std::out_of_range("Position is out of range.");
        if(pos == len) { len--; return; }
        p[pos] = p[len--];
        fix(pos);
        repair(pos);
    }

    void push(const T& val) {
        if(full()) throw std::overflow_error("Heap is full.");
        p[++len] = val;
        fix(len);
    }

    T top() const {
        if(empty()) throw std::underflow_error("Heap is empty.");
        return p[1];
    }

    void pop_top() {
        if(empty()) throw std::underflow_error("Heap is empty.");
        p[1] = p[len--];
        repair(1);
    }
};

#endif // MYHEAP_HPP
