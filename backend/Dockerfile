FROM golang:1.23.4-bookworm AS builder
WORKDIR /app

# Copy only dependency files first to leverage caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the code
COPY . .

# Build with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=builder /app/main /app/main
EXPOSE 3000
ENTRYPOINT ["./main"]