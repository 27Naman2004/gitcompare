package com.gitcompare.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@gitcompare.com}")
    private String fromEmail;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("GitCompare - Your OTP Code");
        message.setText("Your OTP code for GitCompare is: " + otp + "\n\nThis code will expire in 10 minutes.");
        
        try {
            mailSender.send(message);
            log.info("OTP email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", to, e);
            throw new RuntimeException("Could not send email. Please try again later.");
        }
    }

    public void sendPasswordResetEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("GitCompare - Password Reset Request");
        message.setText("You requested a password reset. Your verification code is: " + otp + "\n\nIf you did not request this, please ignore this email.");
        
        try {
            mailSender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", to, e);
            throw new RuntimeException("Could not send email. Please try again later.");
        }
    }

    public void sendSuggestionConfirmation(String userEmail, String title) {
        // Thank-you email to the suggester (only if they provided their email)
        if (userEmail != null && !userEmail.isEmpty()) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(fromEmail);
                msg.setTo(userEmail);
                msg.setSubject("GitCompare - We got your suggestion! 🚀");
                msg.setText(
                    "Hey there!\n\n" +
                    "Thank you for submitting your suggestion to GitCompare:\n" +
                    "\"" + title + "\"\n\n" +
                    "We read every single suggestion. If it aligns with our roadmap, you'll see it ship in a future release!\n\n" +
                    "Keep building,\n" +
                    "Naman Katre\n" +
                    "GitCompare Platform"
                );
                mailSender.send(msg);
                log.info("Suggestion confirmation sent to {}", userEmail);
            } catch (Exception e) {
                log.warn("Could not send confirmation to suggester: {}", e.getMessage());
            }
        }

        // Notify the platform owner about new suggestion
        try {
            SimpleMailMessage ownerMsg = new SimpleMailMessage();
            ownerMsg.setFrom(fromEmail);
            ownerMsg.setTo(fromEmail); // sends to yourself
            ownerMsg.setSubject("[GitCompare] New Suggestion: " + title);
            ownerMsg.setText(
                "A new suggestion was submitted on GitCompare.\n\n" +
                "Title: " + title + "\n" +
                "From: " + (userEmail != null && !userEmail.isEmpty() ? userEmail : "Anonymous") + "\n\n" +
                "Check your MongoDB 'suggestions' collection for full details."
            );
            mailSender.send(ownerMsg);
            log.info("Suggestion notification sent to platform owner");
        } catch (Exception e) {
            log.warn("Could not send notification to owner: {}", e.getMessage());
        }
    }
}
