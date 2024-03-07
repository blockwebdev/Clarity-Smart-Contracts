;; using a map here to store individual counter values
(define-map counters principal uint)

;; using a read only function here to return the counter
;; value for a specified principal
(define-read-only (get-count (who principal))
    (default-to u0 (map-get? counters who))
)

;; public function 'count-up' that will increment the counter
;; for the 'tx-sender'
(define-public (count-up)
    (begin
        (ok (map-set counters tx-sender (+ (get-count tx-sender) u1)))
    )
)
