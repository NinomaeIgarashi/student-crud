package com.reyes.student;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// HomeController: Handles default root route redirection to prevent Spring Boot Whitelabel 404 errors
@Controller
public class HomeController {

    // Critical: Redirects root path requests directly to /reyes/students. If misconfigured or omitted, accessing the backend URL on Render results in a 404 Whitelabel Error page.
    @GetMapping("/")
    public String index() {
        return "redirect:/reyes/students";
    }
}
