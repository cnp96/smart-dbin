# Smart Dustbin

https://smart-dbin.herokuapp.com

# APIs

1. (Register a dustbin) `POST /api/create/dustbin`

   **Request**

   ```
   {
       "name": "Dustbin name",
       "secret": "Dustbin secret to open without OTP"
   }
   ```

   **Response**

   ```

   ```

2. (Generate OTP) `POST /api/create/otp`

   **Request**

   ```
   {
       "dustbin": "Dustbin name",
       "mobile": "Mobile number to send OTP"
   }
   ```

   **Response**

   ```

   ```

3. (Verify OTP) `GET /api/verify/otp/:dustbin/:mobile/:otp`

   **Response**

   ```
    {
        data: "OTP Verified"
    }
   ```

4. (Add/Update rewards) `POST /api/user/reward`

   **Request**

   ```
   {
       "mobile": "Mobile number to udpate reward",
       "reward": "Points to increment"
   }
   ```

5. (Get reward points) `GET /api/user/reward/:mobile`

   **Response**

   ```
   {
       "mobile": "Mobile number",
       "reward": "Available reward points"
   }
   ```
